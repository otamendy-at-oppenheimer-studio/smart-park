# utils.py — Funciones auxiliares del sistema de estacionamiento

import cv2
import numpy as np
import json
import os
import time

SPOTS_FILE = "parking_spots.json"

def load_spots():
    if not os.path.exists(SPOTS_FILE):
        raise FileNotFoundError(f"No se encontró {SPOTS_FILE}")
    with open(SPOTS_FILE) as f:
        return json.load(f)

def check_occupancy(frame, spots, detections):
    """
    Verifica si los lugares están ocupados según las detecciones del modelo.
    """
    status = []
    for spot in spots:
        (x1, y1), (x2, y2) = spot["coords"]
        roi = (x1, y1, x2, y2)
        occupied = False
        vehicle_class = None

        for det in detections:
            (vx1, vy1, vx2, vy2, cls, conf) = det
            if conf < 0.4:
                continue
            # Si el bbox del vehículo se solapa con el espacio de estacionamiento
            if overlap(roi, (vx1, vy1, vx2, vy2)):
                occupied = True
                vehicle_class = cls
                break

        status.append({
            "id": spot["id"],
            "occupied": occupied,
            "vehicle_class": vehicle_class
        })
    return status

def overlap(boxA, boxB):
    """Calcula si hay solapamiento entre dos cajas (x1,y1,x2,y2)."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    return (xB - xA > 0) and (yB - yA > 0)
