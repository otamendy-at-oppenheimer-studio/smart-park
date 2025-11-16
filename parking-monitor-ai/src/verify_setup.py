#!/usr/bin/env python3
"""
Script de utilidad para verificar y configurar la integración con PostgreSQL.
"""

import os
import sys
import json
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor

# Rutas absolutas
PROJECT_ROOT = Path(__file__).parent.parent
SPOT_MAPPING_FILE = PROJECT_ROOT / "config" / "spot_mapping.json"

# Configuración PostgreSQL
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5433")),
    "user": os.environ.get("DB_USER", "admin"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "database": os.environ.get("DB_NAME", "parkingdb")
}


def test_connection():
    """Prueba la conexión a PostgreSQL."""
    print("🔍 Probando conexión a PostgreSQL...")
    print(f"   Host: {DB_CONFIG['host']}")
    print(f"   Puerto: {DB_CONFIG['port']}")
    print(f"   Base de datos: {DB_CONFIG['database']}")
    print(f"   Usuario: {DB_CONFIG['user']}")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        print(f"✅ Conexión exitosa!")
        print(f"   PostgreSQL version: {version[0][:50]}...")
        return True
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        print("\n💡 Verifica:")
        print("   1. PostgreSQL está corriendo")
        print("   2. Las credenciales son correctas")
        print("   3. El puerto es el correcto (5433 por defecto)")
        return False


def list_parking_spaces():
    """Lista todos los espacios de estacionamiento disponibles."""
    print("\n📋 Espacios de estacionamiento en la base de datos:")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT id, "spaceCode", status, floor FROM parking_spaces ORDER BY "spaceCode"')
        spaces = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not spaces:
            print("⚠️  No hay espacios creados en la base de datos.")
            print("\n💡 Crea espacios desde el backend:")
            print("   curl -X POST http://localhost:3000/parking/spaces/multiple \\")
            print("     -H 'Authorization: Bearer TOKEN' \\")
            print("     -H 'Content-Type: application/json' \\")
            print("     -d '{\"count\": 4}'")
            return []
        
        print(f"\n{'ID':<38} {'Código':<10} {'Estado':<15} {'Piso':<10}")
        print("-" * 75)
        for space in spaces:
            status_icon = "🚗" if space['status'] == 'occupied' else "🟩" if space['status'] == 'free' else "❓"
            floor_str = space['floor'] if space['floor'] else "N/A"
            print(f"{space['id']} {space['spaceCode']:<10} {status_icon} {space['status']:<12} {floor_str:<10}")
        
        return spaces
    except Exception as e:
        print(f"❌ Error al listar espacios: {e}")
        return []


def verify_spot_mapping():
    """Verifica que el mapeo de plazas sea válido."""
    print("\n🗺️  Verificando mapeo de plazas...")
    
    if not SPOT_MAPPING_FILE.exists():
        print(f"⚠️  No se encontró {SPOT_MAPPING_FILE}")
        return False
    
    try:
        with open(SPOT_MAPPING_FILE, "r") as f:
            mapping = json.load(f)
        
        print(f"   Archivo: {SPOT_MAPPING_FILE}")
        print(f"   Plazas mapeadas: {len(mapping)}")
        
        # Verificar que cada spaceCode existe en la BD
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        all_valid = True
        for spot_id, space_code in mapping.items():
            cursor.execute('SELECT id FROM parking_spaces WHERE "spaceCode" = %s', (space_code,))
            result = cursor.fetchone()
            
            if result:
                print(f"   ✅ {spot_id} → {space_code} (UUID: {result['id'][:8]}...)")
            else:
                print(f"   ❌ {spot_id} → {space_code} (NO EXISTE en la BD)")
                all_valid = False
        
        cursor.close()
        conn.close()
        
        if all_valid:
            print("✅ Todos los códigos del mapeo existen en la BD")
        else:
            print("\n⚠️  Algunos códigos no existen. Actualiza el mapeo o crea los espacios.")
        
        return all_valid
    except Exception as e:
        print(f"❌ Error al verificar mapeo: {e}")
        return False


def generate_mapping_template(spaces):
    """Genera una plantilla de mapeo basada en los espacios existentes."""
    print("\n📝 Generando plantilla de mapeo...")
    
    if not spaces:
        print("⚠️  No hay espacios para generar plantilla")
        return
    
    mapping = {}
    for i, space in enumerate(spaces[:10], start=1):  # Solo los primeros 10
        mapping[str(i)] = space['spaceCode']
    
    template_file = PROJECT_ROOT / "config" / "spot_mapping_template.json"
    with open(template_file, "w") as f:
        json.dump(mapping, f, indent=4)
    
    print(f"✅ Plantilla creada en: {template_file}")
    print("\n📋 Contenido:")
    print(json.dumps(mapping, indent=4))
    print(f"\n💡 Copia este archivo a {SPOT_MAPPING_FILE} y ajusta según tus plazas configuradas.")


def main():
    print("=" * 75)
    print("🚗 Smart Park - Verificación de Integración PostgreSQL")
    print("=" * 75)
    
    # Test de conexión
    if not test_connection():
        sys.exit(1)
    
    # Listar espacios
    spaces = list_parking_spaces()
    
    # Verificar mapeo
    mapping_valid = verify_spot_mapping()
    
    # Generar plantilla si no hay mapeo válido
    if not mapping_valid and spaces:
        response = input("\n¿Generar plantilla de mapeo automáticamente? (s/n): ")
        if response.lower() == 's':
            generate_mapping_template(spaces)
    
    print("\n" + "=" * 75)
    print("✅ Verificación completa")
    print("=" * 75)
    
    if mapping_valid:
        print("\n🎉 Todo listo para ejecutar el monitor de IA!")
        print("   python parking_monitor.py")
    else:
        print("\n⚠️  Completa la configuración antes de ejecutar el monitor.")


if __name__ == "__main__":
    main()
