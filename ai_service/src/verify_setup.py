#!/usr/bin/env python3
"""
verify_setup.py

Script de utilidad para verificar y configurar la integración con Oracle Database.
"""

import os
import sys
import json
from pathlib import Path
import oracledb

PROJECT_ROOT = Path(__file__).parent.parent
SPOT_MAPPING_FILE = PROJECT_ROOT / "config" / "spot_mapping.json"

# Configuración Oracle Database
DB_CONFIG = {
    "user": os.environ.get("DB_USER", "parkingapp"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "dsn": f"{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '1521')}/{os.environ.get('DB_SID', 'FREEPDB1')}"
}


def test_connection():
    """Prueba la conexión a Oracle Database."""
    print("🔍 Probando conexión a Oracle Database...")
    print(f"   DSN: {DB_CONFIG['dsn']}")
    print(f"   Usuario: {DB_CONFIG['user']}")
    
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        
        print("✅ Conexión exitosa!")
        print(f"   Oracle version: {version[0][:50]}...")
        return True
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False


def list_parking_spaces():
    """Lista todas las plazas de estacionamiento en la BD."""
    print("\n📊 Listando parking_spaces...")
    
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT "id", "spaceCode", "status", "floor" FROM "parking_spaces" ORDER BY "spaceCode"')
        spaces = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not spaces:
            print("⚠️  No hay plazas de estacionamiento en la BD.")
            print("   El backend con TypeORM las creará automáticamente al iniciarse.")
            return []
        
        print(f"   Total: {len(spaces)} plazas\n")
        for space in spaces:
            space_id, space_code, status, floor = space
            print(f"   • {space_code} → ID: {space_id[:8]}... | Estado: {status} | Piso: {floor or 'N/A'}")
        
        return spaces
        
    except Exception as e:
        print(f"❌ Error al listar plazas: {e}")
        return []


def verify_spot_mapping(spaces):
    """Verifica que el mapeo de plazas coincida con la BD."""
    print("\n🗺️  Verificando spot_mapping.json...")
    
    if not SPOT_MAPPING_FILE.exists():
        print(f"⚠️  No existe {SPOT_MAPPING_FILE}")
        print("   Creando mapeo básico...")
        return
    
    try:
        with open(SPOT_MAPPING_FILE, 'r') as f:
            mapping = json.load(f)
        
        space_codes_in_db = {s[1] for s in spaces}  # s[1] es spaceCode
        space_codes_in_mapping = set(mapping.values())
        
        missing_in_mapping = space_codes_in_db - space_codes_in_mapping
        extra_in_mapping = space_codes_in_mapping - space_codes_in_db
        
        if not missing_in_mapping and not extra_in_mapping:
            print("✅ El mapeo está sincronizado con la BD")
        else:
            if missing_in_mapping:
                print(f"⚠️  Plazas en BD pero no en mapping: {missing_in_mapping}")
            if extra_in_mapping:
                print(f"⚠️  Plazas en mapping pero no en BD: {extra_in_mapping}")
                
    except Exception as e:
        print(f"❌ Error al verificar mapeo: {e}")


def test_space_query():
    """Prueba una consulta típica que hace parking_monitor.py"""
    print("\n🧪 Probando consulta de ejemplo...")
    
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Buscar una plaza por código
        test_codes = ["A-01", "A-02", "A-03", "A-04"]
        for space_code in test_codes:
            cursor.execute('SELECT "id" FROM "parking_spaces" WHERE "spaceCode" = :1', (space_code,))
            result = cursor.fetchone()
            
            if result:
                print(f"✅ Encontrado {space_code}: {result[0][:8]}...")
                break
        else:
            print("⚠️  No se encontraron plazas de prueba (A-01, A-02, etc.)")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error en consulta: {e}")


def main():
    print("=" * 60)
    print("   🚗 Verificación de Setup - Oracle Database")
    print("=" * 60)
    
    if not test_connection():
        print("\n❌ No se pudo conectar a Oracle. Verifica:")
        print("   1. Que el contenedor Oracle esté corriendo")
        print("   2. Las variables de entorno (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_SID)")
        sys.exit(1)
    
    spaces = list_parking_spaces()
    
    if spaces:
        verify_spot_mapping(spaces)
        test_space_query()
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada")
    print("=" * 60)


if __name__ == "__main__":
    main()
