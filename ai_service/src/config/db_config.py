"""
Configuración de la base de datos para conectar desde Python
"""
import os

# URL del backend API (lee desde variable de entorno o usa default)
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3000')

# Configuración de endpoints
PARKING_SPACES_ENDPOINT = f"{BACKEND_API_URL}/parking/spaces"
DELETE_ALL_SPACES_ENDPOINT = f"{BACKEND_API_URL}/parking/spaces"
CREATE_SPACE_WITH_COORDS_ENDPOINT = f"{BACKEND_API_URL}/parking/spaces/with-coords"
