#!/bin/bash
# Script de inicio rápido para el sistema de espacios de estacionamiento

echo "🚀 CHECKLIST DE INICIO - SISTEMA DE PARKING"
echo "============================================"
echo ""

# 1. Verificar backend
echo "📌 PASO 1: Verificar Backend"
if curl -s http://localhost:3000/parking/spaces > /dev/null 2>&1; then
    echo "✅ Backend está corriendo en http://localhost:3000"
else
    echo "❌ Backend NO está corriendo"
    echo "   → Ejecuta: cd backend && npm start"
    exit 1
fi
echo ""

# 2. Verificar base de datos
echo "📌 PASO 2: Verificar Base de Datos"
if curl -s http://localhost:3000/parking/spaces | grep -q "id"; then
    echo "✅ Base de datos conectada correctamente"
else
    echo "⚠️  Posible problema con la base de datos"
fi
echo ""

# 3. Verificar cámara
echo "📌 PASO 3: Verificar Cámara"
if [ -e /dev/video0 ]; then
    echo "✅ Cámara detectada en /dev/video0"
else
    echo "❌ No se detectó cámara en /dev/video0"
    echo "   → Ejecuta: python test_camera.py"
fi
echo ""

# 4. Verificar dependencias de Python
echo "📌 PASO 4: Verificar Dependencias de Python"
cd "$(dirname "$0")"
if python -c "import cv2, requests, oracledb" 2>/dev/null; then
    echo "✅ Dependencias de Python instaladas"
else
    echo "❌ Faltan dependencias de Python"
    echo "   → Ejecuta: pip install -r requirements.txt"
    exit 1
fi
echo ""

# 5. Mostrar siguientes pasos
echo "============================================"
echo "🎯 TODO LISTO. SIGUIENTES PASOS:"
echo "============================================"
echo ""
echo "1️⃣  DIBUJAR ESPACIOS:"
echo "   cd src"
echo "   python draw_spots.py"
echo "   • Presiona 'c' para capturar frame"
echo "   • Clic en esquinas para dibujar espacios"
echo "   • Presiona 'q' para guardar en BD"
echo ""
echo "2️⃣  MONITOREAR ESPACIOS:"
echo "   cd src"
echo "   python parking_monitor.py"
echo "   • El sistema leerá coordenadas desde BD"
echo "   • Detectará vehículos automáticamente"
echo "   • Actualizará estados en BD"
echo ""
echo "============================================"
echo "✅ SISTEMA LISTO PARA USAR"
echo "============================================"
