# fastapi_receiver.py — Servidor REST alternativo para monitoreo (OPCIONAL)
# Este servidor ya no es necesario si usas la integración directa con Oracle Database
# Se mantiene como referencia o para propósitos de debugging

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import uuid
import oracledb

class Spot(BaseModel):
    id: int
    occupied: bool
    vehicle_id: Optional[str] = None
    vehicle_class: Optional[str] = None

class Payload(BaseModel):
    timestamp: int
    spots: List[Spot]

app = FastAPI(
    title="Parking Status Receiver API",
    description="Recibe el estado de ocupación y lo sincroniza con Oracle Database",
    version="2.0.0"
)

# Configuración Oracle Database
DB_CONFIG = {
    "user": os.environ.get("DB_USER", "parkingapp"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "dsn": f"{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '1521')}/{os.environ.get('DB_SID', 'FREEPDB1')}"
}

# Mapeo de IDs a spaceCodes (debe coincidir con spot_mapping.json)
SPOT_MAPPING = {
    1: "A-01",
    2: "A-02",
    3: "A-03",
    4: "A-04"
}


def get_parking_space_id(space_code: str, conn):
    """Obtiene el UUID del parking_space a partir del spaceCode."""
    cursor = conn.cursor()
    cursor.execute('SELECT "id" FROM "parking_spaces" WHERE "spaceCode" = :1', (space_code,))
    result = cursor.fetchone()
    cursor.close()
    return result[0] if result else None


@app.post("/parking/update")
async def update_state(payload: Payload):
    """
    Recibe datos del monitor del estacionamiento y actualiza Oracle Database.
    
    NOTA: Esta ruta es opcional. parking_monitor.py ahora actualiza
    Oracle Database directamente sin necesidad de este servidor.
    """
    conn = None
    updated = 0
    errors = []
    
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        for spot in payload.spots:
            space_code = SPOT_MAPPING.get(spot.id)
            if not space_code:
                errors.append(f"No mapping for spot ID {spot.id}")
                continue
            
            parking_space_uuid = get_parking_space_id(space_code, conn)
            if not parking_space_uuid:
                errors.append(f"Parking space {space_code} not found")
                continue
            
            new_status = 'occupied' if spot.occupied else 'free'
            
            # Obtener estado actual
            cursor.execute(
                'SELECT "status" FROM "parking_spaces" WHERE "id" = :1',
                (parking_space_uuid,)
            )
            result = cursor.fetchone()
            current_status = result[0] if result else None
            
            # Solo actualizar si hay cambio
            if current_status != new_status:
                cursor.execute(
                    'UPDATE "parking_spaces" SET "status" = :1, "updatedAt" = :2 WHERE "id" = :3',
                    (new_status, datetime.now(), parking_space_uuid)
                )
                
                event_id = str(uuid.uuid4())
                cursor.execute(
                    'INSERT INTO "occupancy_events" ("id", "parkingSpaceId", "status", "timestamp") VALUES (:1, :2, :3, :4)',
                    (event_id, parking_space_uuid, new_status, datetime.now())
                )
                
                updated += 1
        
        conn.commit()
        cursor.close()
        
    except Exception as e:
        errors.append(str(e))
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
    
    return {
        "ok": True,
        "received": len(payload.spots),
        "updated": updated,
        "errors": errors if errors else None
    }


@app.get("/parking/state")
async def get_state():
    """Devuelve el estado completo actual del estacionamiento desde Oracle Database."""
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT "id", "spaceCode", "status", "updatedAt" FROM "parking_spaces" ORDER BY "spaceCode"')
        spaces = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total": len(spaces),
            "spaces": [
                {
                    "id": s[0],
                    "spaceCode": s[1],
                    "status": s[2],
                    "updatedAt": s[3].isoformat() if s[3] else None
                }
                for s in spaces
            ]
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/parking/summary")
async def get_summary():
    """Devuelve resumen de plazas libres y ocupadas."""
    try:
        conn = oracledb.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute('SELECT "status", COUNT(*) as count FROM "parking_spaces" GROUP BY "status"')
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        summary = {status[0]: status[1] for status in results}
        total = sum(summary.values())
        
        return {
            "total": total,
            "occupied": summary.get('occupied', 0),
            "free": summary.get('free', 0),
            "unknown": summary.get('unknown', 0),
            "last_update": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def root():
    return {
        "message": "Parking Status Receiver API v2.0",
        "note": "Este servidor es OPCIONAL. parking_monitor.py actualiza Oracle Database directamente.",
        "endpoints": [
            "POST /parking/update - Actualizar estado (legacy)",
            "GET /parking/state - Ver estado actual",
            "GET /parking/summary - Ver resumen"
        ]
    }


# Ejecutar con:
# uvicorn fastapi_receiver:app --reload --host 0.0.0.0 --port 8000
