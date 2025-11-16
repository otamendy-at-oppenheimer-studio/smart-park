#!/bin/bash

# Script para detener todo el sistema Smart Park

echo "════════════════════════════════════════════════════════════════"
echo "🛑 Smart Park - Deteniendo Sistema Completo"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "▶ $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Detener Backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    print_step "Deteniendo Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Backend detenido"
    fi
    rm backend.pid
else
    print_step "Buscando procesos del Backend..."
    pkill -f "nest start" 2>/dev/null && print_success "Backend detenido"
fi

# Detener Frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    print_step "Deteniendo Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Frontend detenido"
    fi
    rm frontend.pid
else
    print_step "Buscando procesos del Frontend..."
    pkill -f "vite" 2>/dev/null && print_success "Frontend detenido"
fi

# Detener Monitor de IA
print_step "Buscando procesos del Monitor de IA..."
pkill -f "parking_monitor.py" 2>/dev/null && print_success "Monitor de IA detenido"

# Detener PostgreSQL (opcional)
echo ""
read -p "¿Detener también PostgreSQL Docker? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    print_step "Deteniendo PostgreSQL..."
    cd parking-iot-system-main
    docker-compose stop postgres
    print_success "PostgreSQL detenido"
    cd ..
fi

echo ""
print_success "Sistema Smart Park detenido completamente"
echo ""
