#!/bin/bash

# Script para crear usuario en el sistema Smart Park

echo "=========================================="
echo "🔐 Creando usuario en Smart Park"
echo "=========================================="
echo ""

# Configuración
API_URL="http://localhost:3000"
EMAIL="otamendynap@gmail.com"
PASSWORD="12341234"
ROLE="admin"

echo "📧 Email: $EMAIL"
echo "🔑 Contraseña: $PASSWORD"
echo "👤 Rol: $ROLE"
echo ""

# Verificar que el backend esté corriendo
echo "Verificando que el backend esté corriendo..."
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo "❌ Error: El backend no está respondiendo en $API_URL"
    echo ""
    echo "Por favor, inicia el backend primero:"
    echo "   cd parking-iot-system-main"
    echo "   npm run start:dev"
    echo ""
    exit 1
fi

echo "✅ Backend detectado"
echo ""

# Crear usuario
echo "Creando usuario..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/users" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "Código HTTP: $HTTP_CODE"
echo "Respuesta del servidor:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

# Verificar si fue exitoso
if [ "$HTTP_CODE" = "201" ] || echo "$BODY" | grep -q "id"; then
    echo "✅ Usuario creado exitosamente!"
    echo ""
    echo "Ahora puedes iniciar sesión con:"
    echo "   Email: $EMAIL"
    echo "   Password: $PASSWORD"
elif echo "$BODY" | grep -q "already exists\|ya existe"; then
    echo "ℹ️  El usuario ya existe."
    echo ""
    echo "Puedes iniciar sesión con:"
    echo "   Email: $EMAIL"
    echo "   Password: $PASSWORD"
else
    echo "⚠️  Hubo un problema al crear el usuario."
    echo "Revisa el mensaje de error arriba."
fi

echo ""
