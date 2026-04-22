"""
Main application entry point.
Initializes the Flask application via the application factory pattern and binds it to a 
dynamic port mapping suitable for both local deployment and continuous integration cloud services.
"""
import os
from api import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Máxima optimización para workers no se puede lograr con debug=True.
    # Desactivamos thread limits si usáramos Waitress / Gunicorn, pero usamos dev WSGI nativo aquí.
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
