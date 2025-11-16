# fastapi_receiver.py — Servidor REST para recibir estado del estacionamiento

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    description="Recibe y muestra el estado actual de ocupación del estacionamiento",
    version="1.0.0"
)

# Estado global en memoria (simple demo; en producción usar DB o cache)
state = {
    "timestamp": 0,
    "spots": {}
}

@app.post("/parking/update")
async def update_state(payload: Payload):
    """Recibe datos del monitor del estacionamiento y actualiza el estado en memoria."""
    state["timestamp"] = payload.timestamp
    for spot in payload.spots:
        state["spots"][spot.id] = spot.dict()
    return {"ok": True, "received": len(payload.spots)}

@app.get("/parking/state")
async def get_state():
    """Devuelve el estado completo actual del estacionamiento."""
    return {
        "timestamp": state["timestamp"],
        "datetime": datetime.fromtimestamp(state["timestamp"]).isoformat() if state["timestamp"] else None,
        "spots": state["spots"]
    }

@app.get("/parking/summary")
async def get_summary():
    """Devuelve resumen de plazas libres y ocupadas."""
    total = len(state["spots"])
    occupied = sum(1 for s in state["spots"].values() if s["occupied"])
    free = total - occupied
    return {
        "total": total,
        "occupied": occupied,
        "free": free,
        "last_update": datetime.fromtimestamp(state["timestamp"]).isoformat() if state["timestamp"] else None
    }

# Ejecutar con:
# uvicorn fastapi_receiver:app --reload --host 0.0.0.0 --port 8000
