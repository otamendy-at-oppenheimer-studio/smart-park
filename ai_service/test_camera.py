#!/usr/bin/env python3
"""
Script para diagnosticar y probar cámaras disponibles
"""
import cv2
import sys
import platform

def get_backends_for_platform():
    """Retorna los backends a probar según el sistema operativo."""
    system = platform.system()
    
    if system == "Windows":
        return [
            ('cv2.CAP_DSHOW (Windows - DirectShow)', cv2.CAP_DSHOW),
            ('cv2.CAP_MSMF (Windows - Media Foundation)', cv2.CAP_MSMF),
            ('cv2.CAP_ANY (Auto)', cv2.CAP_ANY),
        ]
    elif system == "Linux":
        return [
            ('cv2.CAP_V4L2 (Linux)', cv2.CAP_V4L2),
            ('cv2.CAP_ANY (Auto)', cv2.CAP_ANY),
        ]
    elif system == "Darwin":  # macOS
        return [
            ('cv2.CAP_AVFOUNDATION (macOS)', cv2.CAP_AVFOUNDATION),
            ('cv2.CAP_ANY (Auto)', cv2.CAP_ANY),
        ]
    else:
        return [
            ('cv2.CAP_ANY (Auto)', cv2.CAP_ANY),
        ]


def test_camera(index):
    """Prueba si una cámara está disponible."""
    print(f"\n{'='*50}")
    print(f"Probando cámara {index}...")
    print(f"{'='*50}")
    
    backends = get_backends_for_platform()
    
    for name, backend in backends:
        try:
            print(f"\nProbando con backend {name}...")
            cap = cv2.VideoCapture(index, backend)
            
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    h, w = frame.shape[:2]
                    print(f"✅ ÉXITO con {name}")
                    print(f"   Resolución: {w}x{h}")
                    print(f"   FPS: {cap.get(cv2.CAP_PROP_FPS)}")
                    print(f"   Backend activo: {cap.getBackendName()}")
                    cap.release()
                    return True
                else:
                    print(f"⚠️  Cámara abierta pero no pudo leer frame")
                    cap.release()
            else:
                print(f"❌ No se pudo abrir con {name}")
        except Exception as e:
            print(f"❌ Error con {name}: {e}")
    
    return False

def scan_cameras(max_cameras=5):
    """Escanea múltiples índices de cámara."""
    print("="*50)
    print("DIAGNÓSTICO DE CÁMARAS")
    print("="*50)
    print(f"Sistema operativo: {platform.system()} {platform.release()}")
    print(f"OpenCV versión: {cv2.__version__}")
    print("="*50)
    
    available = []
    for i in range(max_cameras):
        if test_camera(i):
            available.append(i)
    
    print("\n" + "="*50)
    print("RESUMEN")
    print("="*50)
    if available:
        print(f"✅ Cámaras disponibles: {available}")
    else:
        print("❌ No se encontraron cámaras disponibles")
    
    return available

if __name__ == "__main__":
    available = scan_cameras()
    
    # Si hay cámaras disponibles, abrir una ventana de prueba
    if available:
        camera_index = available[0]
        print(f"\nAbriendo ventana de prueba con cámara {camera_index}...")
        print("Presiona 'q' para salir")
        
        # Usar el backend apropiado según el sistema
        backends = get_backends_for_platform()
        cap = cv2.VideoCapture(camera_index, backends[0][1])
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("No se pudo leer frame")
                break
            
            cv2.putText(frame, f"Camara {camera_index} - Presiona 'q' para salir", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow(f"Test Camera {camera_index}", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
    
    sys.exit(0 if available else 1)
