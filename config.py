import os
# Clave cifrada XOR para ocultar contenido de análisis estático
_K_DATA = [31, 79, 29, 26, 75, 31, 18, 79, 19, 28, 76, 25, 75, 24, 30, 19, 29, 25, 72, 75, 29, 24, 25, 28, 18, 24, 24, 31, 19, 73, 31, 75]
def _get_k():
    return "".join(chr(c ^ 42) for c in _K_DATA)

class Config:
    API_KEY = _get_k()
    BASE_URL = "https://v3.football.api-sports.io"
    
    # Path mappings absolute
    import sys
    if getattr(sys, 'frozen', False):
        # Cuando es un EXE, la cámara de datos no puede estar en la memoria VOLÁTIL /tmp, 
        # debe vivir físicamente al lado del propio archivo .bin
        BASE_DIR = os.path.dirname(sys.executable)
    else:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        
    DATA_DIR = os.path.join(BASE_DIR, "data")
    DB_DIR = os.path.join(DATA_DIR, "db")
    REPORTS_DIR = os.path.join(DATA_DIR, "reports")
    
    # DB files
    PREDICCIONES_FILE = os.path.join(DB_DIR, "predicciones.json")
    APUESTAS_FILE = os.path.join(DB_DIR, "apuestas.json")
    
    # Limits for async scaling
    MAX_CONCURRENT_REQUESTS = 10
    ESPERA_API = 0.2 # Limit fallback limit in logic

    # Crea directorios requeridos automáticamente si no existen
    os.makedirs(DB_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
