#!/bin/bash

# Script de inicio rápido para Smart Park AI Monitor
# Este script verifica la configuración y ejecuta el monitor de IA

echo "========================================"
echo "🚗 Smart Park - AI Monitor Setup"
echo "========================================"
echo ""

# Verificar Python
echo "📦 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "🔧 Activando entorno virtual..."
    source venv/bin/activate
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ $PYTHON_VERSION"
echo ""

# Verificar dependencias
echo "📦 Verificando dependencias de Python..."
if ! python -c "import oracledb" 2>/dev/null; then
    echo "⚠️  oracledb no está instalado"
    echo "💡 Instalando dependencias..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
else
    echo "✅ Dependencias instaladas"
fi
echo ""

# Verificar archivo .env
echo "🔧 Verificando configuración..."
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "💡 Creando desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales antes de continuar"
    echo ""
    echo "Presiona Enter para continuar (o Ctrl+C para salir y editar .env)..."
    read
else
    echo "✅ Archivo .env encontrado"
fi
echo ""

# Cargar variables de entorno
if [ -f .env ]; then
    set -a  # Exportar automáticamente todas las variables
    source .env
    set +a
fi

# Verificar archivos de configuración
echo "📁 Verificando archivos de configuración..."
if [ ! -f config/parking_spots.json ]; then
    echo "❌ config/parking_spots.json no encontrado"
    echo "💡 Este archivo define las coordenadas de las plazas de estacionamiento"
    exit 1
fi
echo "✅ parking_spots.json encontrado"

if [ ! -f config/spot_mapping.json ]; then
    echo "⚠️  config/spot_mapping.json no encontrado"
    echo "💡 Este archivo mapea los IDs numéricos a los códigos del backend"
    echo "💡 Ejecutando script de verificación..."
    python src/verify_setup.py
    exit 1
fi
echo "✅ spot_mapping.json encontrado"
echo ""

# Verificar modelo YOLO
echo "🤖 Verificando modelo YOLO..."
if [ ! -f runs/train/toycar_detector_finalsafe4/weights/best.pt ]; then
    echo "❌ Modelo YOLO no encontrado en runs/train/toycar_detector_finalsafe4/weights/best.pt"
    exit 1
fi
echo "✅ Modelo encontrado"
echo ""

# Ejecutar verificación de setup
echo "🔍 Verificando conexión a base de datos..."
python src/verify_setup.py
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error en la verificación. Revisa la configuración antes de continuar."
    exit 1
fi
echo ""

# Preguntar si desea iniciar
echo "========================================"
echo "✅ Todo listo para iniciar el monitor"
echo "========================================"
echo ""
echo "¿Iniciar el monitor de IA ahora? (s/n): "
read -r response

if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    echo ""
    echo "🚀 Iniciando parking_monitor.py..."
    echo "   Presiona 'q' en la ventana del monitor para detenerlo"
    echo ""
    cd src
    python parking_monitor.py
else
    echo ""
    echo "ℹ️  Para iniciar manualmente:"
    echo "   cd src"
    echo "   python parking_monitor.py"
fi
