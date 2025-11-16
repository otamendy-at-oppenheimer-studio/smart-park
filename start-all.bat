@echo off
REM Script para iniciar todo el sistema Smart Park (Windows)
REM Este script inicia Backend, Frontend y Monitor de IA automáticamente

setlocal enabledelayedexpansion

echo ================================================================
echo 🚗 Smart Park - Iniciando Sistema Completo
echo ================================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "parking-iot-system-main" (
    echo ✗ Error: Este script debe ejecutarse desde la raiz del proyecto smart-park
    pause
    exit /b 1
)
if not exist "SmartParking-master" (
    echo ✗ Error: No se encuentra la carpeta SmartParking-master
    pause
    exit /b 1
)
if not exist "parking-monitor-ai" (
    echo ✗ Error: No se encuentra la carpeta parking-monitor-ai
    pause
    exit /b 1
)

REM Crear carpeta de logs si no existe
if not exist "logs" mkdir logs

REM ============================================================================
REM PASO 1: BACKEND + POSTGRESQL
REM ============================================================================
echo.
echo ▶ PASO 1/4: Iniciando Backend y PostgreSQL...
echo.

cd parking-iot-system-main

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠ Docker no esta instalado. PostgreSQL debe estar corriendo manualmente.
) else (
    echo   Iniciando PostgreSQL con Docker...
    docker-compose up -d postgres
    if errorlevel 1 (
        echo ✗ Error al iniciar PostgreSQL
        pause
        exit /b 1
    )
    echo ✓ PostgreSQL iniciado correctamente
    timeout /t 3 >nul
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm no esta instalado
    pause
    exit /b 1
)

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo   Instalando dependencias del backend...
    call npm install
)

REM Iniciar backend en segundo plano
echo   Iniciando Backend NestJS...
start "Smart Park - Backend" /MIN cmd /c "npm run start:dev > ..\logs\backend.log 2>&1"

echo ✓ Backend iniciado
echo   └─ Logs: logs\backend.log
echo   └─ URL: http://localhost:3000

cd ..

REM ============================================================================
REM PASO 2: FRONTEND
REM ============================================================================
echo.
echo ▶ PASO 2/4: Iniciando Frontend Vue.js...
echo.

cd SmartParking-master

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo   Instalando dependencias del frontend...
    call npm install
)

REM Iniciar frontend en segundo plano
echo   Iniciando servidor Vite...
start "Smart Park - Frontend" /MIN cmd /c "npm run dev > ..\logs\frontend.log 2>&1"

echo ✓ Frontend iniciado
echo   └─ Logs: logs\frontend.log
echo   └─ URL: http://localhost:5173 (verificar en logs)

cd ..

REM ============================================================================
REM PASO 3: VERIFICAR CONFIGURACIÓN IA
REM ============================================================================
echo.
echo ▶ PASO 3/4: Verificando configuracion del Monitor de IA...
echo.

cd parking-monitor-ai

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python no esta instalado
    pause
    exit /b 1
)

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠ Archivo .env no encontrado. Creando desde .env.example...
    if exist ".env.example" (
        copy .env.example .env
        echo ⚠ IMPORTANTE: Edita parking-monitor-ai\.env con tus credenciales
    ) else (
        echo ✗ No se encontro .env.example
        pause
        exit /b 1
    )
)

REM Verificar dependencias de Python
echo   Verificando dependencias de Python...
python -c "import psycopg2" >nul 2>&1
if errorlevel 1 (
    echo ⚠ Instalando dependencias de Python...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ✗ Error al instalar dependencias de Python
        pause
        exit /b 1
    )
)

REM Verificar configuración
echo   Verificando configuracion de la base de datos...
timeout /t 5 >nul
python src\verify_setup.py > ..\logs\ia-verify.log 2>&1
if errorlevel 1 (
    echo ⚠ Verificacion con advertencias. Ver logs\ia-verify.log
    echo.
    echo ⚠ Si hay errores de configuracion, cierra esta ventana (Ctrl+C) y corrige:
    echo     1. Edita parking-monitor-ai\.env con credenciales correctas
    echo     2. Edita parking-monitor-ai\config\spot_mapping.json
    echo     3. Asegurate de que los espacios existan en el backend
    echo.
    echo Presiona Enter para continuar de todos modos, o Ctrl+C para cancelar...
    pause >nul
)

cd ..

REM ============================================================================
REM PASO 4: MONITOR DE IA
REM ============================================================================
echo.
echo ▶ PASO 4/4: Iniciando Monitor de IA...
echo.

cd parking-monitor-ai\src

echo ⚠ El monitor de IA se ejecutara en esta ventana.
echo ⚠ Se abrira una ventana de OpenCV mostrando la deteccion.
echo.
echo ⚠ Para detener TODO el sistema:
echo     1. Presiona 'q' en la ventana de OpenCV
echo     2. O cierra esta ventana de comandos
echo.
timeout /t 2 >nul

echo   Iniciando parking_monitor.py...
echo.

REM Ejecutar monitor de IA (en primer plano para ver la ventana)
python parking_monitor.py

REM ============================================================================
REM CLEANUP AL SALIR
REM ============================================================================
echo.
echo ================================================================
echo ⚠ Monitor de IA detenido.
echo ▶ Deteniendo otros servicios...
echo ================================================================

cd ..\..

REM Matar procesos de Node.js (backend y frontend)
echo   Deteniendo Backend y Frontend...
taskkill /FI "WindowTitle eq Smart Park - Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Smart Park - Frontend*" /F >nul 2>&1

echo.
echo ✓ Sistema Smart Park completamente detenido
echo.
pause
