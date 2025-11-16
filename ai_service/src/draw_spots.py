# draw_spots.py — Captura un frame de la cámara Logitech y guarda coordenadas en config/parking_spots.json

import cv2
import json
import os

# 📁 Ruta donde se guardan las coordenadas
CONFIG_DIR = "config"
SPOTS_FILE = os.path.join(CONFIG_DIR, "parking_spots.json")

CAMERA_INDEX = 0  # Tu cámara Logitech
CAMERA_BACKEND = cv2.CAP_MSMF  # Backend moderno de Windows
CAMERA_RESOLUTION = (640, 480)


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
