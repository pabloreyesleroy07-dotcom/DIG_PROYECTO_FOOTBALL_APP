"""
API Blueprint module for handling frontend-backend traffic.
Provides RESTful endpoints for rendering dashboards, generating reports, and validating database predictions.
"""

import os
import json
import requests
from datetime import datetime
from flask import Blueprint, render_template, jsonify, request
from config import Config
from core.engine_football import lanzar_scan

api_bp = Blueprint('api', __name__)

@api_bp.route("/")
def index():
    """
    Renders the primary single-page application index.html.
    
    :return: Rendered HTML template.
    """
    return render_template("index.html")

@api_bp.route("/api/reports", methods=["GET"])
def list_reports():
    """
    Scans the local reports directory and fetches all historical TXT reports.
    
    :return: A JSON array containing dictionaries with filename and timestamp data.
    """
    reports = []
    if os.path.exists(Config.REPORTS_DIR):
        for filename in os.listdir(Config.REPORTS_DIR):
            if filename.startswith("Reporte_") and filename.endswith(".txt"):
                filepath = os.path.join(Config.REPORTS_DIR, filename)
                mod_time = os.path.getmtime(filepath)
                reports.append({
                    "filename": filename,
                    "date_str": filename.replace("Reporte_", "").replace(".txt", ""),
                    "timestamp": mod_time
                })
        reports.sort(key=lambda x: x["timestamp"], reverse=True)
    return jsonify(reports)

@api_bp.route("/api/reports/<filename>", methods=["GET"])
def get_report(filename):
    """
    Retrieves the raw text content of a specified report file.
    
    :param filename: The exact name of the file to retrieve.
    :return: A JSON object containing the stringified text content or an error payload.
    """
    if not (filename.startswith("Reporte_") and filename.endswith(".txt")):
        return jsonify({"error": "Invalid file format"}), 400
        
    filepath = os.path.join(Config.REPORTS_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Report not found"}), 404
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    return jsonify({"filename": filename, "content": content})

@api_bp.route('/api/generate', methods=['POST'])
def run_generator():
    """
    Triggers the asynchronous data extraction engine for a given date.
    
    :return: A JSON object confirming triggering success or exception details.
    """
    data = request.json
    dia = data.get("dia")
    if not dia:
        return jsonify({"error": "Missing day / date parameter"}), 400
        
    res = lanzar_scan(dia=dia)
    if res and res.get("error"):
        return jsonify({"success": False, "error": res["error"]})
        
    return jsonify({"success": True, "message": "Generation complete (Async)."})

@api_bp.route('/api/generate_historic', methods=['POST'])
def process_verify():
    """
    A simulated hook waiting for integration with AI validation processes.
    
    :return: JSON success message.
    """
    import time
    time.sleep(2)
    return jsonify({"success": True, "message": "Scan Finished Successfully"})

@api_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    """
    Reads the dynamic local JSON database consisting of predictions and cross-checks them with ongoing API outcomes.
    If a prediction is missing validation, it queries the match statistics to automatically determine hit_rate accuracy.
    
    :return: A JSON dictionary with calculated algorithmic success rates.
    """
    if not os.path.exists(Config.PREDICCIONES_FILE):
        return jsonify({"success": True, "stats": {"total": 0, "won": 0, "hit_rate": 0, "pending": 0}})
        
    try:
        with open(Config.PREDICCIONES_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        headers = { 'x-apisports-key': Config.API_KEY }
        updated_data = False
        today = datetime.now().strftime("%Y-%m-%d")
        
        for p in data:
            if not p.get("checked") and p.get("date") <= today:
                try:
                    res = requests.get(f"{Config.BASE_URL}/fixtures", params={"id": p["id"]}, headers=headers).json()
                    match_info = res.get("response", [])
                    if match_info:
                        status = match_info[0]["fixture"]["status"]["short"]
                        if status in ["FT", "AET", "PEN"]:
                            goals = match_info[0]["goals"]
                            score_h = goals["home"]
                            score_a = goals["away"]
                            
                            ambos_marcan = (score_h > 0 and score_a > 0)
                            stats_res = requests.get(f"{Config.BASE_URL}/fixtures/statistics", params={"fixture": p["id"]}, headers=headers).json()
                            
                            c_home = 0; c_away = 0
                            for tm in stats_res.get("response", []):
                                for s in tm["statistics"]:
                                    if s["type"] == "Corner Kicks" and s["value"] is not None:
                                        if tm["team"]["id"] == match_info[0]["teams"]["home"]["id"]: c_home = s["value"]
                                        else: c_away = s["value"]
                            
                            total_corners = c_home + c_away
                            tags = p.get("tags", [])
                            won = False
                            
                            if "ambos_marcan" in tags and ambos_marcan: won = True
                            if "corners" in tags and total_corners > 8: won = True
                            if "ambos_marcan" in tags and "corners" in tags:
                                won = ambos_marcan and total_corners > 8
                                
                            p["checked"] = True
                            p["won"] = won
                            updated_data = True
                except Exception as e:
                    print("Error verifying DB:", e)
                    
        if updated_data:
            with open(Config.PREDICCIONES_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                
        total = len(data)
        checked = [p for p in data if p.get("checked")]
        won = len([p for p in checked if p.get("won")])
        pending = total - len(checked)
        
        hit_rate = 0
        if len(checked) > 0:
            hit_rate = int((won / len(checked)) * 100)
            
        stats = {"total": total, "won": won, "hit_rate": hit_rate, "pending": pending}
        return jsonify({"success": True, "stats": stats})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@api_bp.route('/api/shutdown', methods=['POST'])
def shutdown():
    """
    Shuts down the backend server.
    """
    shutdown_func = request.environ.get('werkzeug.server.shutdown')
    if shutdown_func is None:
        os.kill(os.getpid(), 9)
    else:
        shutdown_func()
    return jsonify({"success": True, "message": "Server shutting down..."})
