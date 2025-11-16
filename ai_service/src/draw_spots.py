# draw_spots.py — Captura un frame de la cámara Logitech y guarda coordenadas en config/parking_spots.json

import cv2
import json
import os
import platform
import uuid
from datetime import datetime

# Importar oracledb para conexión directa a la BD
try:
    import oracledb
    DB_AVAILABLE = True
except ImportError:
    print("[AVISO] oracledb no está instalado. Las coordenadas solo se guardarán en JSON.")
    DB_AVAILABLE = False

# 📁 Ruta donde se guardan las coordenadas
CONFIG_DIR = "config"
SPOTS_FILE = os.path.join(CONFIG_DIR, "parking_spots.json")

# Configuración de la base de datos Oracle (misma que el backend)
DB_CONFIG = {
    "user": os.environ.get("DB_USER", "parkingapp"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "dsn": f"{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '1521')}/{os.environ.get('DB_SID', 'FREEPDB1')}"
}

CAMERA_INDEX = 0  # Tu cámara Logitech

# Detectar sistema operativo y seleccionar backend apropiado
_system = platform.system()
if _system == "Windows":
    CAMERA_BACKEND = cv2.CAP_MSMF  # Backend moderno de Windows
elif _system == "Linux":
    CAMERA_BACKEND = cv2.CAP_V4L2  # Backend para Linux (Video4Linux2)
elif _system == "Darwin":  # macOS
    CAMERA_BACKEND = cv2.CAP_AVFOUNDATION
else:
    CAMERA_BACKEND = cv2.CAP_ANY  # Auto-detectar

CAMERA_RESOLUTION = (640, 480)

print(f"[INFO] Sistema detectado: {_system}")
print(f"[INFO] Backend de cámara: {CAMERA_BACKEND}")
print(f"[INFO] Base de datos Oracle: {DB_CONFIG['dsn']}")


def capture_frame(video_source=0):
    """Captura un frame de la cámara Logitech."""
    cap = cv2.VideoCapture(video_source, CAMERA_BACKEND)
    if not cap.isOpened():
        print(f"[ERROR] No se pudo abrir la cámara {video_source}.")
        return None

    # Configurar resolución
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_RESOLUTION[0])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_RESOLUTION[1])
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    print("[INFO] Cámara iniciada. Presiona 'c' para capturar el frame o 'q' para salir.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] No se pudo leer el frame de la cámara.")
            cap.release()
            return None

        cv2.imshow("Capture Frame", frame)
        key = cv2.waitKey(33)
        if key == ord("c"):
            cap.release()
            cv2.destroyAllWindows()
            return frame
        elif key == ord("q"):
            cap.release()
            cv2.destroyAllWindows()
            return None


def define_spots(video_source=0):
    """Captura un frame y permite definir zonas de estacionamiento, guardando el resultado en JSON."""
    # Crear carpeta config si no existe
    os.makedirs(CONFIG_DIR, exist_ok=True)

    # Capturar frame
    img = capture_frame(video_source)
    if img is None:
        print("[ERROR] No se pudo capturar el frame. Terminando.")
        return

    clone = img.copy()
    spots = []
    current = []

    def click_event(event, x, y, flags, param):
        nonlocal current, spots
        if event == cv2.EVENT_LBUTTONDOWN:
            current.append((x, y))
            cv2.circle(clone, (x, y), 5, (0, 0, 255), -1)
            cv2.imshow("Define Spots", clone)

            if len(current) == 2:
                x1, y1 = current[0]
                x2, y2 = current[1]
                if x1 != x2 and y1 != y2:
                    cv2.rectangle(clone, current[0], current[1], (0, 255, 0), 2)
                    spot_id = len(spots) + 1
                    cv2.putText(clone, str(spot_id), (x1, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
                    spots.append({"id": spot_id, "coords": current})
                else:
                    print(f"[AVISO] Rectángulo inválido en {current}, se ignorará.")
                current = []

    cv2.namedWindow("Define Spots")
    cv2.setMouseCallback("Define Spots", click_event)

    print("🟩 Instrucciones:")
    print("  • Clic izquierdo = marca dos puntos (esquina superior izq. y esquina inferior der.)")
    print("  • 'q' = guardar y salir")

    while True:
        cv2.imshow("Define Spots", clone)
        key = cv2.waitKey(1)
        if key == ord("q"):
            break

    cv2.destroyAllWindows()

    # Guardar las coordenadas en config/parking_spots.json
    try:
        with open(SPOTS_FILE, "w") as f:
            json.dump(spots, f, indent=4)
        print(f"[✅ OK] {len(spots)} lugares guardados en {SPOTS_FILE}")
    except Exception as e:
        print(f"[ERROR] No se pudo guardar el archivo {SPOTS_FILE}: {e}")
    
    # ========== GUARDAR DIRECTAMENTE EN LA BASE DE DATOS ORACLE ==========
    if len(spots) > 0 and DB_AVAILABLE:
        print("\n[INFO] Conectando con la base de datos Oracle...")
        conn = None
        try:
            # Conectar a Oracle
            conn = oracledb.connect(**DB_CONFIG)
            cursor = conn.cursor()
            print("[✅ BD] Conexión exitosa a Oracle Database")
            
            # 1. Borrar todos los registros relacionados primero (en orden de dependencias)
            print("[INFO] Eliminando registros relacionados...")
            
            # Borrar eventos de ocupación
            cursor.execute('DELETE FROM "occupancy_events"')
            events_deleted = cursor.rowcount
            print(f"[✅ BD] Eventos de ocupación eliminados: {events_deleted}")
            
            # Borrar sensores
            cursor.execute('DELETE FROM "sensors"')
            sensors_deleted = cursor.rowcount
            print(f"[✅ BD] Sensores eliminados: {sensors_deleted}")
            
            # Ahora sí borrar los espacios de estacionamiento
            cursor.execute('DELETE FROM "parking_spaces"')
            spaces_deleted = cursor.rowcount
            conn.commit()
            print(f"[✅ BD] Espacios anteriores eliminados: {spaces_deleted}")
            
            # 2. Crear nuevos espacios con coordenadas
            created_count = 0
            for spot in spots:
                try:
                    (x1, y1), (x2, y2) = spot["coords"]
                    
                    # Generar UUID y código de espacio
                    space_uuid = str(uuid.uuid4())
                    letter = chr(65 + ((spot["id"] - 1) // 99))  # A, B, C...
                    number = str(((spot["id"] - 1) % 99) + 1).zfill(2)
                    space_code = f"{letter}-{number}"
                    
                    # Insertar en la base de datos
                    cursor.execute(
                        '''INSERT INTO "parking_spaces" 
                           ("id", "spaceCode", "status", "x1", "y1", "x2", "y2", "createdAt", "updatedAt")
                           VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)''',
                        (
                            space_uuid,
                            space_code,
                            'unknown',
                            int(x1),
                            int(y1),
                            int(x2),
                            int(y2),
                            datetime.now(),
                            datetime.now()
                        )
                    )
                    created_count += 1
                    print(f"[✅ BD] Espacio {space_code} creado con coordenadas ({x1},{y1}) -> ({x2},{y2})")
                    
                except Exception as e:
                    print(f"[ERROR BD] Error al crear espacio {spot['id']}: {e}")
            
            conn.commit()
            cursor.close()
            print(f"\n[🎉 COMPLETADO] {created_count}/{len(spots)} espacios guardados en la base de datos")
            
        except Exception as e:
            print(f"[ERROR BD] Error de conexión a Oracle: {e}")
            print(f"[INFO] Verifica las variables de entorno: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_SID")
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()
    elif not DB_AVAILABLE:
        print("\n[INFO] oracledb no disponible: coordenadas guardadas solo en JSON")



def draw_spots(frame, spots_cache=None):
    """Dibuja las zonas de estacionamiento guardadas en el frame."""
    if spots_cache is not None:
        spots = spots_cache
    else:
        if not os.path.exists(SPOTS_FILE):
            print(f"[ERROR] El archivo {SPOTS_FILE} no existe.")
            return frame
        try:
            with open(SPOTS_FILE) as f:
                spots = json.load(f)
        except Exception as e:
            print(f"[ERROR] No se pudo cargar el archivo {SPOTS_FILE}: {e}")
            return frame

    if frame is None:
        print("[ERROR] El frame proporcionado es inválido.")
        return frame

    for spot in spots:
        try:
            (x1, y1), (x2, y2) = spot["coords"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, str(spot["id"]), (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
        except (KeyError, ValueError) as e:
            print(f"[AVISO] Plaza {spot.get('id', 'desconocida')} con coordenadas inválidas: {e}")

    return frame


if __name__ == "__main__":
    # Usa directamente tu cámara Logitech
    define_spots(CAMERA_INDEX)
