#!/bin/bash

# Script para iniciar todo el sistema Smart Park
# Este script inicia Backend, Frontend y Monitor de IA automáticamente

echo "════════════════════════════════════════════════════════════════"
echo "🚗 Smart Park - Iniciando Sistema Completo"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "parking-iot-system-main" ] || [ ! -d "SmartParking-master" ] || [ ! -d "parking-monitor-ai" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto smart-park"
    exit 1
fi

# ============================================================================
# PASO 1: BACKEND + POSTGRESQL
# ============================================================================
echo ""
print_step "PASO 1/4: Iniciando Backend y PostgreSQL..."

cd parking-iot-system-main

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. PostgreSQL debe estar corriendo manualmente."
else
    print_step "Iniciando PostgreSQL con Docker..."
    # Comprobación del estado del daemon docker
    DOCKER_ACTIVE=0
    if command -v systemctl &> /dev/null; then
        if systemctl is-active --quiet docker; then
            DOCKER_ACTIVE=1
        else
            DOCKER_ACTIVE=0
        fi
    else
        # Fallback: probar docker info
        docker info > /dev/null 2>&1 && DOCKER_ACTIVE=1 || DOCKER_ACTIVE=0
    fi

    if [ $DOCKER_ACTIVE -eq 0 ]; then
        print_error "El daemon Docker no está activo o no responde."
        # Si estamos ejecutando como root intentamos reiniciarlo automáticamente
        if [ "$(id -u)" -eq 0 ]; then
            print_step "Intentando reiniciar el servicio docker (se requieren privilegios)..."
            systemctl restart docker 2>/dev/null || service docker restart 2>/dev/null
            sleep 2
            if systemctl is-active --quiet docker 2>/dev/null || docker info > /dev/null 2>&1; then
                print_success "Docker reiniciado correctamente"
            else
                print_error "No se pudo reiniciar Docker. Revisa el estado del daemon y los logs."
                echo "  Comandos útiles:"
                echo "    sudo systemctl status docker"
                echo "    sudo journalctl -u docker -n 200 --no-pager"
                echo "    sudo docker info"
                exit 1
            fi
        else
            print_error "Por favor, inicia Docker (ej: 'sudo systemctl start docker') o ejecuta este script como root para intentar reiniciarlo automáticamente."
            exit 1
        fi
    fi

    # Intentar obtener la imagen primero para detectar errores de overlay/espacio
    print_step "Intentando descargar la imagen postgres:15 para verificar estado del almacenamiento..."
    if ! docker pull postgres:15; then
        print_error "Error al obtener la imagen 'postgres:15'. Esto puede indicar problemas con el almacenamiento de Docker (overlay2) o falta de espacio en disco."
        echo "  Acciones recomendadas (con precaución):"
        echo "    1) Revisar espacio en disco: df -h"
        echo "    2) Ver logs de Docker: sudo journalctl -u docker -n 200 --no-pager"
        echo "    3) Intentar reiniciar Docker: sudo systemctl restart docker"
        echo "    4) Si persiste, evaluar: sudo docker system prune -a --volumes  (borra imágenes/containers no usados)"
        exit 1
    fi

    docker-compose up -d postgres
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL iniciado correctamente"
        sleep 3
    else
        print_error "Error al iniciar PostgreSQL con docker-compose"
        echo "  Revisa: sudo docker ps -a  && sudo docker-compose logs postgres"
        exit 1
    fi
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    print_step "Instalando dependencias del backend..."
    npm install
fi

# Iniciar backend en segundo plano
print_step "Iniciando Backend NestJS..."
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Guardar PID
echo $BACKEND_PID > ../backend.pid
print_success "Backend iniciado (PID: $BACKEND_PID)"
echo "  └─ Logs: logs/backend.log"
echo "  └─ URL: http://localhost:3000"

cd ..

# ============================================================================
# PASO 2: FRONTEND
# ============================================================================
echo ""
print_step "PASO 2/4: Iniciando Frontend Vue.js..."

cd SmartParking-master

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    print_step "Instalando dependencias del frontend..."
    npm install
fi

# Iniciar frontend en segundo plano
print_step "Iniciando servidor Vite..."
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Guardar PID
echo $FRONTEND_PID > ../frontend.pid
print_success "Frontend iniciado (PID: $FRONTEND_PID)"
echo "  └─ Logs: logs/frontend.log"
echo "  └─ URL: http://localhost:5173 (verificar en logs)"

cd ..

# ============================================================================
# PASO 3: VERIFICAR CONFIGURACIÓN IA
# ============================================================================
echo ""
print_step "PASO 3/4: Verificando configuración del Monitor de IA..."

cd parking-monitor-ai

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado"
    exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado. Creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "IMPORTANTE: Edita parking-monitor-ai/.env con tus credenciales"
    else
        print_error "No se encontró .env.example"
        exit 1
    fi
fi

# Verificar dependencias de Python
print_step "Verificando dependencias de Python..."
python3 -c "import psycopg2" 2>/dev/null
if [ $? -ne 0 ]; then
    print_warning "Instalando dependencias de Python..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        print_error "Error al instalar dependencias de Python"
        exit 1
    fi
fi

# Verificar configuración
print_step "Verificando configuración de la base de datos..."
sleep 5  # Dar tiempo al backend para iniciar
python3 src/verify_setup.py > ../logs/ia-verify.log 2>&1
if [ $? -ne 0 ]; then
    print_warning "Verificación con advertencias. Ver logs/ia-verify.log"
    echo ""
    print_warning "Si hay errores de configuración, detén el script (Ctrl+C) y corrige:"
    print_warning "  1. Edita parking-monitor-ai/.env con credenciales correctas"
    print_warning "  2. Edita parking-monitor-ai/config/spot_mapping.json"
    print_warning "  3. Asegúrate de que los espacios existan en el backend"
    echo ""
    echo "Presiona Enter para continuar de todos modos, o Ctrl+C para cancelar..."
    read
fi

cd ..

# ============================================================================
# PASO 4: MONITOR DE IA
# ============================================================================
echo ""
print_step "PASO 4/4: Iniciando Monitor de IA..."

cd parking-monitor-ai/src

print_warning "El monitor de IA se ejecutará en primer plano."
print_warning "Se abrirá una ventana de OpenCV mostrando la detección."
echo ""
print_warning "Para detener TODO el sistema:"
print_warning "  1. Presiona 'q' en la ventana de OpenCV"
print_warning "  2. O ejecuta: bash ../stop-all.sh"
echo ""
sleep 2

print_step "Iniciando parking_monitor.py..."
echo ""

# Ejecutar monitor de IA (en primer plano para ver la ventana)
python3 parking_monitor.py

# ============================================================================
# CLEANUP AL SALIR
# ============================================================================
echo ""
echo "════════════════════════════════════════════════════════════════"
print_warning "Monitor de IA detenido."
print_step "Deteniendo otros servicios..."
echo "════════════════════════════════════════════════════════════════"

cd ../..

# Leer PIDs y matar procesos
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    kill $BACKEND_PID 2>/dev/null
    print_success "Backend detenido (PID: $BACKEND_PID)"
    rm backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    print_success "Frontend detenido (PID: $FRONTEND_PID)"
    rm frontend.pid
fi

echo ""
print_success "Sistema Smart Park completamente detenido"
echo ""
