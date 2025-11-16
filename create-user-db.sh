#!/bin/bash

# Script para crear usuario administrador directamente en PostgreSQL

echo "=========================================="
echo "🔐 Creando usuario administrador en PostgreSQL"
echo "=========================================="
echo ""

# Configuración
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="parkingdb"
DB_USER="admin"
DB_PASSWORD="admin123"

EMAIL="otamendynap@gmail.com"
PASSWORD="12341234"
ROLE="admin"

echo "📧 Email: $EMAIL"
echo "🔑 Contraseña: $PASSWORD"
echo "👤 Rol: $ROLE"
echo ""

# Hash de la contraseña usando bcrypt (necesitamos Node.js para esto)
echo "Generando hash de contraseña..."

# Ejecutar el hash (desde el directorio del backend donde está bcrypt instalado)
cd /home/iurem/Code/smart-park/parking-iot-system-main
PASSWORD_HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$PASSWORD', 10, (err, hash) => { if(err) process.exit(1); else console.log(hash); });" 2>/dev/null)

if [ -z "$PASSWORD_HASH" ]; then
    echo "⚠️  No se pudo generar hash dinámicamente, usando hash pre-generado para '12341234'"
    # Hash de "12341234" generado previamente con bcrypt
    PASSWORD_HASH='$2b$10$YuNn1NkfFYdFXCk.0fQffO3hk08s2WH3yEuwOfy.mnDfPjgvLIw1a'
fi

echo "✅ Hash generado"
echo ""

# Crear usuario en PostgreSQL
echo "Insertando usuario en la base de datos..."

sudo docker exec -i parking-db psql -U $DB_USER -d $DB_NAME << EOF
-- Verificar si el usuario ya existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = '$EMAIL' AND deleted IS NULL) THEN
        INSERT INTO users (email, password, role)
        VALUES (
            '$EMAIL',
            '$PASSWORD_HASH',
            '$ROLE'
        );
        RAISE NOTICE 'Usuario creado exitosamente';
    ELSE
        RAISE NOTICE 'El usuario ya existe';
    END IF;
END \$\$;

-- Mostrar el usuario creado
SELECT id, email, role, "createdAt" FROM users WHERE email = '$EMAIL' AND deleted IS NULL;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Operación completada"
    echo ""
    echo "Ahora puedes iniciar sesión con:"
    echo "   Email: $EMAIL"
    echo "   Password: $PASSWORD"
else
    echo ""
    echo "❌ Error al conectar a PostgreSQL"
    echo ""
    echo "Verifica que PostgreSQL esté corriendo:"
    echo "   docker ps | grep parking-db"
fi

echo ""
