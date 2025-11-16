import cv2

# ✅ Tu cámara Logitech es la número 2
CAMERA_INDEX = 0

# ✅ Usamos el backend moderno de Windows (Media Foundation)
cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_MSMF)

# Configuramos la resolución deseada
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():
    print(f"❌ No se pudo abrir la cámara {CAMERA_INDEX}.")
else:
    print(f"✅ Cámara {CAMERA_INDEX} detectada correctamente (Logitech).")
    print("Presiona 'q' para salir.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ No se pudo leer frame. Intentando nuevamente...")
            continue

        # Mostramos la imagen
        cv2.imshow("Cámara Logitech (USB)", frame)

        # Salir con la tecla Q
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("👋 Saliendo del modo cámara.")
            break

# Liberamos recursos
cap.release()
cv2.destroyAllWindows()
