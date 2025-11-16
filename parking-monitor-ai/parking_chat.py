# parking_chat.py — Chat IA para consultar lugares libres en el estacionamiento

import json
import os
import time
from datetime import datetime

# Archivo donde se guarda el estado del estacionamiento
STATUS_FILE = "parking_status.json"

def load_parking_status():
    """Carga el estado más reciente del estacionamiento desde el archivo JSON."""
    if not os.path.exists(STATUS_FILE):
        return {"timestamp": 0, "spots": []}
    try:
        with open(STATUS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] No se pudo cargar {STATUS_FILE}: {e}")
        return {"timestamp": 0, "spots": []}

def get_free_spots():
    """Devuelve la lista de lugares libres basándose en el estado actual."""
    status = load_parking_status()
    free_spots = [spot["id"] for spot in status["spots"] if not spot["occupied"]]
    return free_spots

def chat():
    """Interfaz de chat para consultar lugares libres."""
    print("¡Bienvenido al Chat de Estacionamiento! (Escribe 'salir' para terminar)")
    print(f"Hora actual: {datetime.now().strftime('%H:%M:%S - %d/%m/%Y')}")
    
    while True:
        user_input = input("Tú: ").lower().strip()
        
        if user_input == "salir":
            print("¡Adiós! Espero verte de nuevo.")
            break
        
        if "lugar" in user_input or "libre" in user_input or "disponible" in user_input:
            free_spots = get_free_spots()
            if not free_spots:
                print("IA: Lo siento, no hay lugares libres en este momento.")
            else:
                print(f"IA: Hay {len(free_spots)} lugar(es) libre(s): {', '.join(map(str, free_spots))}")
            timestamp = datetime.fromtimestamp(load_parking_status()["timestamp"])
            print(f"IA: Estado actualizado a las {timestamp.strftime('%H:%M:%S - %d/%m/%Y')}")
        else:
            print("IA: Por favor, pregunta por los lugares libres (ej. '¿Qué lugares están libres?') o escribe 'salir'.")

if __name__ == "__main__":
    chat()