# parking_monitor.py
import cv2
import torch
import time
import os
import sys
import platform
import json
import uuid
from pathlib import Path
from ultralytics import YOLO
import oracledb
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

# Configuración Oracle Database (mismo que el backend)
DB_CONFIG = {
    "user": os.environ.get("DB_USER", "parkingapp"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "dsn": f"{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '1521')}/{os.environ.get('DB_SID', 'FREEPDB1')}"
}


# --- FUNCIONES PRINCIPALES ---
def load_spots_from_db():
    """Carga las coordenadas de plazas desde la base de datos."""
    conn = None
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT "id", "spaceCode", "x1", "y1", "x2", "y2" FROM "parking_spaces" WHERE "x1" IS NOT NULL ORDER BY "spaceCode"'
        )
        rows = cursor.fetchall()
        cursor.close()
        
        spots = []
        spot_mapping = {}
        for idx, (uuid_val, space_code, x1, y1, x2, y2) in enumerate(rows, start=1):
            spots.append({
                "id": idx,
                "coords": [(x1, y1), (x2, y2)],
                "spaceCode": space_code,
                "uuid": uuid_val
            })
            spot_mapping[idx] = space_code
        
        print(f"[INFO] ✅ Cargadas {len(spots)} plazas desde la base de datos")
        return spots, spot_mapping
        
    except Exception as e:
        print(f"[ERROR] Error al cargar plazas desde BD: {e}")
        print(f"[INFO] Intentando cargar desde archivo JSON como respaldo...")
        return load_spots_from_json()
    finally:
        if conn is not None:
            conn.close()


def load_spots_from_json():
    """Carga las coordenadas de plazas desde JSON (respaldo)."""
    spots = []
    spot_mapping = {}
    
    if not SPOTS_FILE.exists():
        print(f"[ERROR] No se encontró el archivo {SPOTS_FILE}")
        return [], {}
    
    try:
        with open(SPOTS_FILE, "r") as f:
            spots = json.load(f)
        
        # Cargar mapeo si existe
        if SPOT_MAPPING_FILE.exists():
            with open(SPOT_MAPPING_FILE, "r") as f:
                mapping = json.load(f)
                spot_mapping = {int(k): v for k, v in mapping.items()}
        
        print(f"[INFO] ⚠️  Cargadas {len(spots)} plazas desde JSON (modo respaldo)")
        return spots, spot_mapping
        
    except Exception as e:
        print(f"[ERROR] No se pudo leer archivos JSON: {e}")
        return [], {}


def load_spots():
    """DEPRECATED: Usar load_spots_from_db() o load_spots_from_json() directamente."""
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
    """DEPRECATED: El mapeo ahora se carga directamente desde load_spots_from_db()."""
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
        cursor = conn.cursor()
        cursor.execute('SELECT "id" FROM "parking_spaces" WHERE "spaceCode" = :1', (space_code,))
        result = cursor.fetchone()
        cursor.close()
        if result:
            return result[0]
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
    # Crear lista de clases válidas basada en lo que el modelo puede detectar
    vehicle_classes = []
    if MODEL.names:
        # Añadir todas las clases que contengan 'car' o 'toy' en su nombre
        for class_name in MODEL.names.values():
            if 'car' in class_name.lower() or 'toy' in class_name.lower():
                vehicle_classes.append(class_name)
    
    # Si no se encontraron clases, usar valores por defecto
    if not vehicle_classes:
        vehicle_classes = ["toy_car", "car", "vehicle"]
    
    print(f"\n[DEBUG] ========== NUEVO CICLO DE DETECCIÓN ==========")
    print(f"[DEBUG] Clases de vehículos aceptadas: {vehicle_classes}")
    print(f"[DEBUG] Total de detecciones: {len(detections)}")
    
    # Imprimir todas las detecciones primero
    for i, det in enumerate(detections):
        dx1, dy1, dx2, dy2, cls, conf = det
        print(f"[DEBUG] Detección #{i+1}: clase='{cls}', confianza={conf:.2f}, bbox=[{dx1},{dy1},{dx2},{dy2}]")

    # Ahora revisar cada spot
    for spot in spots:
        spot_id = spot["id"]
        (x1, y1), (x2, y2) = spot["coords"]
        
        # 🔧 NORMALIZAR COORDENADAS: asegurar que x1,y1 sea esquina superior-izquierda
        x1_norm = min(x1, x2)
        y1_norm = min(y1, y2)
        x2_norm = max(x1, x2)
        y2_norm = max(y1, y2)
        
        occupied = False
        
        print(f"\n[DEBUG] --- Revisando Plaza {spot_id} ---")
        print(f"[DEBUG]   Coords originales: [{x1},{y1},{x2},{y2}]")
        print(f"[DEBUG]   Coords normalizadas: [{x1_norm},{y1_norm},{x2_norm},{y2_norm}]")

        for i, det in enumerate(detections):
            dx1, dy1, dx2, dy2, cls, conf = det
            
            if cls not in vehicle_classes:
                print(f"[DEBUG]   Det#{i+1}: Ignorada - clase '{cls}' no válida")
                continue
                
            if conf < 0.3:
                print(f"[DEBUG]   Det#{i+1}: Ignorada - confianza {conf:.2f} muy baja")
                continue

            # Calcular intersección usando coordenadas normalizadas
            x_left = max(x1_norm, dx1)
            y_top = max(y1_norm, dy1)
            x_right = min(x2_norm, dx2)
            y_bottom = min(y2_norm, dy2)

            if x_right > x_left and y_bottom > y_top:
                intersection_area = (x_right - x_left) * (y_bottom - y_top)
                spot_area = (x2_norm - x1_norm) * (y2_norm - y1_norm)
                overlap = intersection_area / spot_area
                
                print(f"[DEBUG]   Det#{i+1}: Solapamiento = {overlap*100:.2f}% (área intersección={intersection_area}, área plaza={spot_area})")

                # 🔽 Umbral de solapamiento muy bajo para toy cars pequeños
                if overlap > 0.02:
                    occupied = True
                    print(f"[DEBUG]   ✅ Det#{i+1}: Plaza {spot_id} OCUPADA por esta detección!")
                    break
                else:
                    print(f"[DEBUG]   Det#{i+1}: Solapamiento insuficiente ({overlap*100:.2f}% < 2%)")
            else:
                print(f"[DEBUG]   Det#{i+1}: Sin intersección con plaza {spot_id}")

        status.append({"id": spot_id, "occupied": occupied})
        estado_texto = "✅ OCUPADA" if occupied else "🟩 LIBRE"
        print(f"[INFO] Plaza {spot_id}: {estado_texto}")

    return status


def save_to_oracle(status, spot_mapping):
    """
    Guarda el estado de las plazas en Oracle Database (tabla parking_spaces).
    También crea eventos en occupancy_events si hubo cambios.
    """
    conn = None
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
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
                'SELECT "status" FROM "parking_spaces" WHERE "id" = :1',
                (parking_space_uuid,)
            )
            result = cursor.fetchone()
            current_status = result[0] if result else None
            
            # Solo actualizar si hay cambio
            if current_status != new_status:
                # Actualizar parking_spaces
                cursor.execute(
                    'UPDATE "parking_spaces" SET "status" = :1, "updatedAt" = :2 WHERE "id" = :3',
                    (new_status, datetime.now(), parking_space_uuid)
                )
                
                # Crear evento en occupancy_events con UUID generado
                event_id = str(uuid.uuid4())
                cursor.execute(
                    'INSERT INTO "occupancy_events" ("id", "parkingSpaceId", "status", "timestamp") VALUES (:1, :2, :3, :4)',
                    (event_id, parking_space_uuid, new_status, datetime.now())
                )
                
                print(f"[INFO] ✅ Actualizado {space_code} ({parking_space_uuid[:8]}...): {current_status} → {new_status}")
            else:
                print(f"[INFO] ℹ️  {space_code}: Sin cambios ({current_status})")
        
        conn.commit()
        cursor.close()
        print("[INFO] Estado sincronizado con Oracle Database correctamente.\n")
        
    except Exception as e:
        print(f"[ERROR] Error en Oracle Database: {e}")
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
    # Cargar plazas y mapeo desde la base de datos
    spots, spot_mapping = load_spots_from_db()
    
    if not spots:
        print("[ERROR] No se pudieron cargar las plazas desde la BD ni desde JSON.")
        return
    
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
            save_to_oracle(last_status, spot_mapping)
        frame_count += 1

        frame = draw_visuals(frame, spots, last_detections, last_status)
        cv2.imshow("Parking Monitor", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main(0)
