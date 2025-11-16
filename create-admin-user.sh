#!/bin/bash

# Script para crear usuario administrador en Oracle Database
# Smart Parking System

echo "=========================================="
echo "  Creando Usuario Administrador"
echo "=========================================="
echo ""

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "✗ Error: Node.js no está instalado"
    exit 1
fi

# Ir al directorio del backend
cd "$(dirname "$0")/backend"

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "⚠ Instalando dependencias del backend..."
    npm install
fi

# Ejecutar el script de Node.js
node create-admin-user.js

echo ""
echo "=========================================="
