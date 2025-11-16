@echo off
REM Script para detener todo el sistema Smart Park (Windows)

echo ================================================================
echo 🛑 Smart Park - Deteniendo Sistema Completo
echo ================================================================
echo.

echo ▶ Deteniendo Backend y Frontend...
taskkill /FI "WindowTitle eq Smart Park - Backend*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Smart Park - Frontend*" /F >nul 2>&1

REM Buscar por procesos específicos si los anteriores no funcionan
taskkill /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq npm*" /F >nul 2>&1

echo ✓ Backend y Frontend detenidos

echo.
echo ▶ Deteniendo Monitor de IA...
taskkill /FI "WINDOWTITLE eq *parking_monitor*" /F >nul 2>&1
taskkill /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq *parking*" /F >nul 2>&1

echo ✓ Monitor de IA detenido

echo.
set /p REPLY="¿Detener tambien PostgreSQL Docker? (s/N): "
if /i "%REPLY%"=="s" (
    echo ▶ Deteniendo PostgreSQL...
    cd parking-iot-system-main
    docker-compose stop postgres
    echo ✓ PostgreSQL detenido
    cd ..
)

echo.
echo ✓ Sistema Smart Park detenido completamente
echo.
pause
