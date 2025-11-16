import cv2
from ultralytics import YOLO
import os

# Ruta del modelo
MODEL_PATH = "models/best.pt"  # o "best.pt" si lo dejaste en la raíz

# Ruta de la imagen que quieras probar
IMAGE_PATH = r"C:\Users\hpvictus\Downloads\Plaza2Fotos\frame_0050.jpg"

# Cargar el modelo
model = YOLO(MODEL_PATH)

# Verificar que la imagen existe
if not os.path.exists(IMAGE_PATH):
    print(f"[ERROR] No se encontró la imagen en: {IMAGE_PATH}")
    exit()

# Leer la imagen
image = cv2.imread(IMAGE_PATH)

# Realizar la detección
results = model.predict(source=image, conf=0.25, show=False)

# Dibujar resultados
for result in results:
    for box in result.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        label = f"{model.names[cls]} ({conf:.2f})"
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

# Mostrar imagen
cv2.imshow("Test Model - Detección de Auto de Juguete", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
