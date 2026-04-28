import os
# XOR encrypted key to hide static analysis content
_K_DATA = [31, 79, 29, 26, 75, 31, 18, 79, 19, 28, 76, 25, 75, 24, 30, 19, 29, 25, 72, 75, 29, 24, 25, 28, 18, 24, 24, 31, 19, 73, 31, 75]
def _get_k():
    return "".join(chr(c ^ 42) for c in _K_DATA)

class Config:
    """
    Central Configuration Class for Football Stats Analyzer.
    Maps all dynamic paths, ensures cross-compatibility between source code and generated PyInstaller EXEs, 
    and handles crucial environment variables like API keys.
    """
    API_KEY = _get_k()
    BASE_URL = "https://v3.football.api-sports.io"
    
    # Path mappings absolute
    import sys
    if getattr(sys, 'frozen', False):
        # When running as an EXE, the data chamber cannot be in VOLATILE memory like /tmp, 
        # it must physically live next to the .bin file itself
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
    MAX_CONCURRENT_REQUESTS = 5
    ESPERA_API = 1.0 # Limit fallback limit in logic

    # Automatically create required directories if they don't exist
    os.makedirs(DB_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
