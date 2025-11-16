import cv2
import os

# 🔹 Usa la ruta con "Users" (no "Usuarios") y formato crudo
video_path = r"C:\Users\hpvictus\Downloads\plaza4.mp4"

# 🔹 Carpeta de salida
output_folder = r"C:\Users\hpvictus\Downloads\Plaza4Fotos"

interval = 12  # 1 imagen cada 0.4 s aprox (para 30 fps)

os.makedirs(output_folder, exist_ok=True)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"[ERROR] No se pudo abrir el video: {video_path}")
else:
    frame_count = 0
    saved = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % interval == 0:
            filename = os.path.join(output_folder, f"frame_{saved:04d}.jpg")
            cv2.imwrite(filename, frame)
            saved += 1
        frame_count += 1

    cap.release()
    print(f"✅ {saved} imágenes guardadas en {output_folder}")
