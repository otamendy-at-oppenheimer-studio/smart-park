@echo off
REM Script de inicio rápido para Smart Park AI Monitor (Windows)
REM Este script verifica la configuración y ejecuta el monitor de IA

echo ========================================
echo 🚗 Smart Park - AI Monitor Setup
echo ========================================
echo.

REM Verificar Python
echo 📦 Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ %PYTHON_VERSION%
echo.

REM Verificar dependencias
echo 📦 Verificando dependencias de Python...
python -c "import psycopg2" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  psycopg2 no está instalado
    echo 💡 Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias instaladas
)
echo.

REM Verificar archivo .env
echo 🔧 Verificando configuración...
if not exist .env (
    echo ⚠️  Archivo .env no encontrado
    echo 💡 Creando desde .env.example...
    copy .env.example .env
    echo ✅ Archivo .env creado
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales antes de continuar
    echo.
    echo Presiona Enter para continuar (o Ctrl+C para salir y editar .env)...
    pause >nul
) else (
    echo ✅ Archivo .env encontrado
)
echo.

REM Verificar archivos de configuración
echo 📁 Verificando archivos de configuración...
if not exist config\parking_spots.json (
    echo ❌ config\parking_spots.json no encontrado
    echo 💡 Este archivo define las coordenadas de las plazas de estacionamiento
    pause
    exit /b 1
)
echo ✅ parking_spots.json encontrado

if not exist config\spot_mapping.json (
    echo ⚠️  config\spot_mapping.json no encontrado
    echo 💡 Este archivo mapea los IDs numéricos a los códigos del backend
    echo 💡 Ejecutando script de verificación...
    python src\verify_setup.py
    pause
    exit /b 1
)
echo ✅ spot_mapping.json encontrado
echo.

REM Verificar modelo YOLO
echo 🤖 Verificando modelo YOLO...
if not exist runs\train\toycar_detector_finalsafe4\weights\best.pt (
    echo ❌ Modelo YOLO no encontrado en runs\train\toycar_detector_finalsafe4\weights\best.pt
    pause
    exit /b 1
)
echo ✅ Modelo encontrado
echo.

REM Ejecutar verificación de setup
echo 🔍 Verificando conexión a base de datos...
python src\verify_setup.py
if errorlevel 1 (
    echo.
    echo ❌ Error en la verificación. Revisa la configuración antes de continuar.
    pause
    exit /b 1
)
echo.

REM Preguntar si desea iniciar
echo ========================================
echo ✅ Todo listo para iniciar el monitor
echo ========================================
echo.
set /p response="¿Iniciar el monitor de IA ahora? (s/n): "

if /i "%response%"=="s" (
    echo.
    echo 🚀 Iniciando parking_monitor.py...
    echo    Presiona 'q' en la ventana del monitor para detenerlo
    echo.
    cd src
    python parking_monitor.py
) else (
    echo.
    echo ℹ️  Para iniciar manualmente:
    echo    cd src
    echo    python parking_monitor.py
)

pause
