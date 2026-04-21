import os
import sys
from flask import Flask
from config import Config

def create_app():
    # Soporte paramétros si compilas con Pyinstaller (.exe / binario)
    if getattr(sys, 'frozen', False):
        template_folder = os.path.join(sys._MEIPASS, 'templates')
        static_folder = os.path.join(sys._MEIPASS, 'static')
        app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    else:
        # Default de la raíz (saltando api/)
        project_root = os.path.dirname(Config.BASE_DIR) 
        app = Flask(__name__, template_folder=os.path.join(Config.BASE_DIR, 'templates'), static_folder=os.path.join(Config.BASE_DIR, 'static'))

    app.config.from_object(Config)

    from .routes import api_bp
    app.register_blueprint(api_bp)

    return app
