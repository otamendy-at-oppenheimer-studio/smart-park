# 🎯 RESUMEN EJECUTIVO - Sistema de IA para Smart Park

## ¿Qué hace el sistema?

La IA **detecta con una cámara** si hay vehículos en los espacios de estacionamiento y **actualiza automáticamente la base de datos Oracle**, que el frontend lee para mostrar en tiempo real.

---

## 📊 Flujo Simplificado

```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  Cámara  │ --> │   IA    │ --> │  Oracle  │ --> │Frontend │
│          │     │  YOLO   │     │    DB    │     │  Vue.js │
└──────────┘     └─────────┘     └──────────┘     └─────────┘
   Video          Detecta         Actualiza        Muestra
                  ocupación       estado          en tiempo
                                                   real
```

---

## 🔧 3 Archivos Clave

### 1. `config/parking_spots.json` (Coordenadas)
**Lo crea:** `python draw_spots.py`

Define **dónde están** los espacios en la imagen de la cámara:

```json
[
    {"id": 1, "coords": [[x1, y1], [x2, y2]]},  ← Espacio #1
    {"id": 2, "coords": [[x1, y1], [x2, y2]]},  ← Espacio #2
    ...
]
```

### 2. `config/spot_mapping.json` (Mapeo ID → Código)
**Lo editas tú manualmente**

Conecta el ID del espacio dibujado con el código en la BD:

```json
{
    "1": "A-01",  ← El espacio #1 dibujado corresponde a A-01 en la BD
    "2": "A-02",  ← El espacio #2 dibujado corresponde a A-02 en la BD
    ...
}
```

### 3. Oracle DB - Tabla `parking_spaces`
**Lo crea:** Backend NestJS al iniciar

Almacena el estado actual:

| id (UUID) | spaceCode | status | updatedAt |
|-----------|-----------|--------|-----------|
| abc123... | A-01 | free | ... |
| def456... | A-02 | occupied | ... |

---

## 🚀 Pasos para Configurar (Orden Correcto)

### PASO 1: Crear espacios en BD
```bash
# Terminal 1: Iniciar Oracle + Backend
docker-compose up -d oracle
cd backend && npm start

# Terminal 2: Crear espacios
curl -X POST http://localhost:3000/parking/spaces/multiple \
  -H "Content-Type: application/json" \
  -d '{"count": 4}'
```
✅ **Resultado:** BD tiene A-01, A-02, A-03, A-04

---

### PASO 2: Dibujar zonas en la cámara
```bash
cd ai_service/src
python draw_spots.py
```
1. Presiona **'c'** para capturar frame
2. **Clic izquierdo** dos veces por cada espacio (esquinas)
3. Presiona **'q'** para guardar

✅ **Resultado:** `config/parking_spots.json` creado con 4 zonas

---

### PASO 3: Mapear IDs a códigos
```bash
nano ai_service/config/spot_mapping.json
```
Contenido:
```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```
✅ **Resultado:** IA sabe que zona #1 = A-01 en BD

---

### PASO 4: Verificar todo
```bash
cd ai_service/src
python verify_setup.py
```
Debe mostrar:
```
✅ Conexión exitosa a Oracle Database
✅ Espacios encontrados: A-01, A-02, A-03, A-04
✅ Mapeo sincronizado
```

---

### PASO 5: Ejecutar monitor
```bash
python parking_monitor.py
```
La IA:
1. Lee video de cámara
2. Detecta vehículos con YOLO
3. Calcula si cada zona tiene vehículo
4. Actualiza Oracle DB cada 2 segundos

---

### PASO 6: Ver en frontend
```bash
cd frontend && npm run dev
```
Abrir: `http://localhost:5173`

El frontend hace polling cada 5 segundos al backend, que lee de Oracle.

---

## 🔄 Cómo se Actualiza Todo

### Cuando colocas un vehículo en el espacio #2:

```
1. parking_monitor.py detecta:
   [INFO] Plaza 2: ✅ OCUPADA

2. Busca en spot_mapping.json:
   Zona 2 → A-02

3. Actualiza Oracle DB:
   UPDATE parking_spaces 
   SET status = 'occupied' 
   WHERE spaceCode = 'A-02'

4. Crea evento histórico:
   INSERT INTO occupancy_events ...

5. Frontend hace polling (5 seg):
   GET /parking/spaces
   
6. Backend responde con datos de Oracle:
   {"spaceCode": "A-02", "status": "occupied"}

7. Frontend actualiza UI:
   A-02 cambia de verde → rojo 🔴
```

---

## 📁 Ubicación de Archivos

```
smart-park/
├── backend/
│   └── src/modules/parking/  ← Controladores API
│
├── frontend/
│   └── src/components/       ← UI de espacios
│
└── ai_service/
    ├── config/
    │   ├── parking_spots.json    ← COORDENADAS (draw_spots.py crea)
    │   └── spot_mapping.json     ← MAPEO (tú editas)
    │
    └── src/
        ├── draw_spots.py          ← Herramienta para dibujar zonas
        ├── parking_monitor.py     ← SCRIPT PRINCIPAL (ejecutar)
        └── verify_setup.py        ← Verificar configuración
```

---

## 🎓 Conceptos Clave

### ID vs spaceCode
- **ID (1, 2, 3, 4)**: Número temporal cuando dibujas zonas con `draw_spots.py`
- **spaceCode (A-01, A-02)**: Código único **permanente** en la base de datos
- **spot_mapping.json**: Conecta ambos

### ¿Por qué dos archivos?
- `parking_spots.json`: Define **geometría** (coordenadas x,y en pixels)
- `spot_mapping.json`: Define **identidad** (qué zona corresponde a qué espacio de BD)

### ¿Cuándo se actualiza la BD?
Cada ~2 segundos (configurable con `FRAME_SKIP` en `parking_monitor.py`)

### ¿Cuándo se actualiza el frontend?
Cada ~5 segundos (el frontend hace polling al backend)

---

## 🛠️ Comandos Útiles

```bash
# Ver espacios en BD
curl http://localhost:3000/parking/spaces | jq

# Ver un espacio específico
curl http://localhost:3000/parking/spaces | jq '.[] | select(.spaceCode == "A-02")'

# Ver logs de Oracle
docker logs parking-db -f

# Probar cámara
cd ai_service
python test_camera.py

# Verificar configuración IA
cd ai_service/src
python verify_setup.py

# Ejecutar monitor en modo debug
python parking_monitor.py 2>&1 | tee monitor.log
```

---

## ❓ FAQ

### ¿Qué pasa si agrego más espacios?
1. Crear en BD: `POST /parking/spaces/multiple` con `count: X`
2. Dibujar nuevas zonas: `python draw_spots.py` (sobrescribe archivo)
3. Actualizar `spot_mapping.json` con nuevos mapeos
4. Reiniciar `parking_monitor.py`

### ¿Puedo cambiar la posición de una zona?
Sí, ejecuta `python draw_spots.py` de nuevo y dibuja todas las zonas otra vez.

### ¿Qué pasa si el código en spot_mapping.json no existe en BD?
El monitor mostrará: `[WARNING] No se encontró el parking space con código X-XX`
→ Verifica que el espacio existe: `curl http://localhost:3000/parking/spaces`

### ¿Por qué el frontend no se actualiza inmediatamente?
El frontend hace polling cada 5 segundos. Espera ~5-10 segundos máximo.

---

## 📖 Documentación Completa

- **Guía paso a paso:** `ai_service/GUIA_COMPLETA_ESPACIOS.md`
- **README IA:** `ai_service/README.md`
- **API Backend:** `backend/API_FRONTEND_DOCS.md`

---

**¡Listo!** Con esto entiendes el flujo completo del sistema. 🚗✨
