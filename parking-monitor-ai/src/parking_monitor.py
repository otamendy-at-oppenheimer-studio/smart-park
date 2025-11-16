# parking_monitor.py
import cv2
import torch
import time
import os
import sys
import platform
import json
from pathlib import Path
from ultralytics import YOLO
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# --- RUTAS ---
# Obtener el directorio raíz del proyecto (un nivel arriba de src/)
PROJECT_ROOT = Path(__file__).parent.parent
SPOTS_FILE = PROJECT_ROOT / "config" / "parking_spots.json"
SPOT_MAPPING_FILE = PROJECT_ROOT / "config" / "spot_mapping.json"
MODEL_PATH = PROJECT_ROOT / "runs" / "train" / "toycar_detector_finalsafe4" / "weights" / "best.pt"

# --- CONFIGURACIONES ---
DEVICE = "cpu"  # usar CPU para evitar errores cuDNN
MODEL = YOLO(str(MODEL_PATH))
FRAME_SKIP = 2
CAMERA_RESOLUTION = (640, 480)

# Configuración PostgreSQL (mismo que el backend)
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5433")),
    "user": os.environ.get("DB_USER", "admin"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "database": os.environ.get("DB_NAME", "parkingdb")
}


# --- FUNCIONES PRINCIPALES ---
def load_spots():
    """Carga las coordenadas de plazas desde JSON."""
    if not SPOTS_FILE.exists():
        print(f"[ERROR] No se encontró el archivo {SPOTS_FILE}")
        return []
    try:
        with open(SPOTS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] No se pudo leer {SPOTS_FILE}: {e}")
        return []


def load_spot_mapping():
    """Carga el mapeo de ID numérico a spaceCode del backend."""
    if not SPOT_MAPPING_FILE.exists():
        print(f"[ERROR] No se encontró el archivo {SPOT_MAPPING_FILE}")
        return {}
    try:
        with open(SPOT_MAPPING_FILE, "r") as f:
            mapping = json.load(f)
            # Convertir las claves a enteros para facilitar el uso
            return {int(k): v for k, v in mapping.items()}
    except Exception as e:
        print(f"[ERROR] No se pudo leer {SPOT_MAPPING_FILE}: {e}")
        return {}


def get_parking_space_id(space_code, conn):
    """Obtiene el UUID del parking_space a partir del spaceCode."""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id FROM parking_spaces WHERE \"spaceCode\" = %s", (space_code,))
        result = cursor.fetchone()
        cursor.close()
        if result:
            return result['id']
        else:
            print(f"[WARNING] No se encontró el parking space con código {space_code}")
            return None
    except Exception as e:
        print(f"[ERROR] Error al buscar parking space {space_code}: {e}")
        return None


def detect_vehicles(frame):
    """Ejecuta YOLO sobre el frame y devuelve las detecciones."""
    try:
        results = MODEL.predict(frame, device=DEVICE, imgsz=416, conf=0.25, verbose=False)
        detections = []
        for *xyxy, conf, cls in results[0].boxes.data.cpu().numpy():
            detections.append((
                int(xyxy[0]), int(xyxy[1]),
                int(xyxy[2]), int(xyxy[3]),
                MODEL.names[int(cls)], float(conf)
            ))
        return detections
    except Exception as e:
        print(f"[ERROR] Error en detección: {e}")
        return []


def check_occupancy(spots, detections):
    """Determina si cada plaza está ocupada según las detecciones."""
    status = []
    vehicle_classes = ["toy_car" if "toy_car" in MODEL.names else "car"]

    for spot in spots:
        (x1, y1), (x2, y2) = spot["coords"]
        occupied = False

        for det in detections:
            dx1, dy1, dx2, dy2, cls, conf = det
            if cls not in vehicle_classes or conf < 0.4:
                continue

            # Calcular intersección
            x_left = max(x1, dx1)
            y_top = max(y1, dy1)
            x_right = min(x2, dx2)
            y_bottom = min(y2, dy2)

            if x_right > x_left and y_bottom > y_top:
                intersection_area = (x_right - x_left) * (y_bottom - y_top)
                spot_area = (x2 - x1) * (y2 - y1)
                overlap = intersection_area / spot_area

                # 🔽 Relajamos umbral de solapamiento
                if overlap > 0.05:
                    occupied = True
                    break

        status.append({"id": spot["id"], "occupied": occupied})
        estado_texto = "✅ OCUPADA" if occupied else "🟩 LIBRE"
        print(f"[INFO] Plaza {spot['id']}: {estado_texto}")

    return status


def save_to_postgresql(status, spot_mapping):
    """
    Guarda el estado de las plazas en PostgreSQL (tabla parking_spaces).
    También crea eventos en occupancy_events si hubo cambios.
    """
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        for spot in status:
            spot_id = spot["id"]
            occupied = spot["occupied"]
            
            # Obtener el spaceCode correspondiente
            space_code = spot_mapping.get(spot_id)
            if not space_code:
                print(f"[WARNING] No hay mapeo para la plaza ID {spot_id}, se omite.")
                continue
            
            # Obtener el UUID del parking_space
            parking_space_uuid = get_parking_space_id(space_code, conn)
            if not parking_space_uuid:
                print(f"[WARNING] No se encontró el UUID para {space_code}, se omite.")
                continue
            
            # Determinar el nuevo estado
            new_status = 'occupied' if occupied else 'free'
            
            # Obtener el estado actual de la BD
            cursor.execute(
                'SELECT status FROM parking_spaces WHERE id = %s',
                (parking_space_uuid,)
            )
            result = cursor.fetchone()
            current_status = result['status'] if result else None
            
            # Solo actualizar si hay cambio
            if current_status != new_status:
                # Actualizar parking_spaces
                cursor.execute(
                    'UPDATE parking_spaces SET status = %s, "updatedAt" = %s WHERE id = %s',
                    (new_status, datetime.now(), parking_space_uuid)
                )
                
                # Crear evento en occupancy_events
                cursor.execute(
                    'INSERT INTO occupancy_events ("parkingSpaceId", status, timestamp) VALUES (%s, %s, %s)',
                    (parking_space_uuid, new_status, datetime.now())
                )
                
                print(f"[INFO] ✅ Actualizado {space_code} ({parking_space_uuid[:8]}...): {current_status} → {new_status}")
            else:
                print(f"[INFO] ℹ️  {space_code}: Sin cambios ({current_status})")
        
        conn.commit()
        cursor.close()
        print("[INFO] Estado sincronizado con PostgreSQL correctamente.\n")
        
    except Exception as e:
        print(f"[ERROR] Error en PostgreSQL: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn is not None:
            conn.close()


def draw_visuals(frame, spots, detections, status):
    """Dibuja zonas y detecciones en el frame."""
    # Detecciones (azul)
    for det in detections:
        x1, y1, x2, y2, cls, conf = det
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 0), 2)
        cv2.putText(frame, f"{cls} {conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

    # Cuadros de plazas
    for s in status:
        spot = next(sp for sp in spots if sp["id"] == s["id"])
        (x1, y1), (x2, y2) = spot["coords"]
        color = (0, 0, 255) if s["occupied"] else (0, 255, 0)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, str(s["id"]), (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1)
    return frame


def get_camera_backend():
    """Detecta el backend de cámara apropiado según el sistema operativo."""
    system = platform.system()
    
    if system == "Windows":
        backend = cv2.CAP_DSHOW  # DirectShow es más confiable que MSMF en Windows
        backend_name = "DirectShow (Windows)"
    elif system == "Linux":
        backend = cv2.CAP_V4L2  # Video4Linux2 para Linux
        backend_name = "V4L2 (Linux)"
    elif system == "Darwin":  # macOS
        backend = cv2.CAP_AVFOUNDATION
        backend_name = "AVFoundation (macOS)"
    else:
        backend = cv2.CAP_ANY  # Fallback genérico
        backend_name = f"Auto ({system})"
    
    print(f"[INFO] Sistema operativo: {system}")
    print(f"[INFO] Backend de cámara: {backend_name}")
    return backend


def main(video_source=0):
    """Bucle principal del sistema."""
    spots = load_spots()
    if not spots:
        print("[ERROR] No se pudieron cargar las plazas.")
        return
    
    spot_mapping = load_spot_mapping()
    if not spot_mapping:
        print("[ERROR] No se pudo cargar el mapeo de plazas.")
        return
    
    print(f"[INFO] Mapeo de plazas cargado: {spot_mapping}")

    # Detectar backend apropiado según el sistema operativo
    camera_backend = get_camera_backend()
    cap = cv2.VideoCapture(video_source, camera_backend)
    
    if not cap.isOpened():
        print(f"[ERROR] No se pudo abrir la cámara {video_source}.")
        print(f"[SUGERENCIA] Intenta ejecutar: python test_camera.py para diagnosticar el problema.")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])

    print(f"[INFO] Cámara iniciada ({CAMERA_RESOLUTION[0]}x{CAMERA_RESOLUTION[1]}). Presiona 'q' para salir.\n")

    frame_count = 0
    last_detections, last_status = [], []

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] No se pudo leer el frame de la cámara.")
            break

        if frame_count % FRAME_SKIP == 0:
            last_detections = detect_vehicles(frame)
            last_status = check_occupancy(spots, last_detections)
            save_to_postgresql(last_status, spot_mapping)
        frame_count += 1

        frame = draw_visuals(frame, spots, last_detections, last_status)
        cv2.imshow("Parking Monitor", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main(0)
