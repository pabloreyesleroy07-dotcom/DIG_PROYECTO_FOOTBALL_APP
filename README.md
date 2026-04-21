# ⚽ Football Stats Analyzer Pro

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Version](https://img.shields.io/badge/version-4.0.0--stable-green.svg)

An asynchronous, military-grade statistical sports analyzer designed for precision arbitrage betting. It employs big-data parsing over global football REST APIs to predict match outcomes based solely on high-value anomalies rather than human prejudice.

## 🌟 Motivation
The modern sports investment landscape is clouded by heuristic gut feelings. The **Motivation** behind this Open Source engine is achieving *Digital Transformation* at the operational level (OT) by automating thousands of daily parameter evaluations across global leagues, compressing weeks of manual data engineering into a 5-second asynchronous pipeline.

## 🚀 Deployment Instructions
This project is built using Python, Flask, and the async framework `aiohttp`. Wait for the binary to execute, or build your own.

### 1. Local Development deployment
1. Clone the repository.
2. Initialize and activate your Python environment:
   `python3 -m venv venv && source venv/bin/activate`
3. Install strict dependencies:
   `pip install -r requirements.txt` *(Requires Flask, aiohttp, requests, python-dotenv)*
4. Run the core listener directly:
   `python3 run.py`
5. Navigate to `http://127.0.0.1:5000` via your standard browser.

### 2. Standalone Binary Deployment (Linux)
A pre-compiled, self-persisting, and fully byte-code obfuscated binary (`FootballStats_Secure`) is actively generated inside the `/dist` directory.
Just drop the binary on a Linux server and execute it:
```bash
chmod +x ./dist/FootballStats_Secure
./dist/FootballStats_Secure &
```

### 3. Online Cloud Demo
While currently optimized for local execution due to computational speed limits when bypassing API-rate blockages, the structure seamlessly integrates with cloud-hosting environments like **Heroku** or **Render**.
Just connect this repository to Render and specify the start command:
```bash
gunicorn -w 4 -b 0.0.0.0:10000 api:app
```

## 🛠️ Usage Examples
1. **Generating a Diagnostic**: Open the central Dashboard online, select your targeted date in the `date-picker`, and hit **Init Scenario Scanner**.
2. **Reviewing Assertions（Collapsible Menus）**: Filter reports dynamically using the Top Bar. You'll witness output parameters such as: 
   `[!!!] CORNERS: Value anomaly detected. (Confidence: 85%)`
3. **Database AI Extraction Sync**: Use the Neural Net visualizer to automatically fetch historical score-lines across your saved scenarios to auto-tune the "Hit Rate" percentage tracker. 

## 🗺️ Documentation 
Developers can find in-depth Technical Sphinx docs mapped explicitly to HTML format inside `/docs/api_html/`. 
Read our [Developer Devlog](docs/Devlog_LinkedIn.md) for our journey through code evolution.

## 🤝 Contribution Guidelines
Read our complete internal mechanisms for collaborating (and tackling current unhandled future expansion milestones) at [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License
This venture operates under an open source [MIT License](LICENSE).
