# 🎯 Guía Completa: Espacios de Estacionamiento con Base de Datos

## 📋 Resumen del Flujo Completo

Este sistema conecta **draw_spots.py** directamente con la **base de datos** para que todas las coordenadas de los espacios de estacionamiento se guarden automáticamente y el **parking_monitor.py** las lea desde ahí.

---

## 🔄 Flujo de Trabajo

### **1. Dibujar Espacios (draw_spots.py)**

```bash
cd ai_service/src
python draw_spots.py
```

**¿Qué hace?**
1. ✅ Abre la cámara y captura un frame (presiona 'c')
2. ✅ Te permite dibujar rectángulos haciendo clic en las esquinas
3. ✅ Cuando presionas 'q':
   - **Borra TODOS los espacios anteriores** de la BD
   - **Guarda las coordenadas en JSON** (respaldo)
   - **Crea nuevos espacios en la BD** con:
     - `spaceCode`: A-01, A-02, B-01, etc.
     - Coordenadas: `x1`, `y1`, `x2`, `y2`
     - Estado inicial: `unknown`

**Salida esperada:**
```
[INFO] Sistema detectado: Linux
[INFO] Backend de cámara: 2800
[INFO] Conectando con la base de datos...
[✅ BD] Espacios anteriores eliminados: 5
[✅ BD] Espacio A-01 creado con coordenadas (120,80) -> (200,150)
[✅ BD] Espacio A-02 creado con coordenadas (210,80) -> (290,150)
...
[🎉 COMPLETADO] 5/5 espacios guardados en la base de datos
```

---

### **2. Monitorear Espacios (parking_monitor.py)**

```bash
cd ai_service/src
python parking_monitor.py
```

**¿Qué hace?**
1. ✅ **Lee las coordenadas directamente desde la BD** (no desde JSON)
2. ✅ Detecta vehículos con YOLO
3. ✅ Determina si cada espacio está ocupado o libre
4. ✅ **Actualiza el estado en la BD** automáticamente
5. ✅ Crea eventos en `occupancy_events` cuando hay cambios

**Salida esperada:**
```
[INFO] ✅ Cargadas 5 plazas desde la base de datos
[INFO] Mapeo de plazas cargado: {1: 'A-01', 2: 'A-02', 3: 'A-03', ...}
[INFO] Sistema operativo: Linux
[INFO] Backend de cámara: V4L2 (Linux)
[INFO] Cámara iniciada (640x480). Presiona 'q' para salir.

[INFO] Plaza 1: 🟩 LIBRE
[INFO] Plaza 2: ✅ OCUPADA
[INFO] ✅ Actualizado A-02: free → occupied
[INFO] Estado sincronizado con Oracle Database correctamente.
```

---

## 🗄️ Cambios en la Base de Datos

### **Tabla `parking_spaces` (actualizada)**

```sql
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY,
    spaceCode VARCHAR(10) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'unknown',
    floor VARCHAR(50),
    x1 INT,          -- ✨ NUEVO: Coordenada X superior izquierda
    y1 INT,          -- ✨ NUEVO: Coordenada Y superior izquierda
    x2 INT,          -- ✨ NUEVO: Coordenada X inferior derecha
    y2 INT,          -- ✨ NUEVO: Coordenada Y inferior derecha
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);
```

---

## 🌐 Nuevos Endpoints del Backend

### **1. Borrar todos los espacios**
```http
DELETE http://localhost:3000/parking/spaces
```

**Respuesta:**
```json
{
  "message": "Todos los espacios eliminados con éxito",
  "deletedCount": 5
}
```

---

### **2. Crear espacio con coordenadas**
```http
POST http://localhost:3000/parking/spaces/with-coords
Content-Type: application/json

{
  "spaceCode": "A-01",
  "x1": 120,
  "y1": 80,
  "x2": 200,
  "y2": 150,
  "floor": "Planta Baja"
}
```

**Respuesta:**
```json
{
  "message": "Espacio creado con coordenadas",
  "space": {
    "id": "uuid-generado",
    "spaceCode": "A-01",
    "x1": 120,
    "y1": 80,
    "x2": 200,
    "y2": 150,
    "status": "unknown",
    "createdAt": "2025-11-16T10:30:00Z",
    "updatedAt": "2025-11-16T10:30:00Z"
  }
}
```

---

## 🚀 Pasos para Usar el Sistema

### **Paso 1: Instalar dependencias**
```bash
cd ai_service
pip install -r requirements.txt
```

### **Paso 2: Asegurarse de que el backend esté corriendo**
```bash
cd backend
npm start
```

### **Paso 3: Dibujar los espacios**
```bash
cd ai_service/src
python draw_spots.py
```
1. Presiona **'c'** para capturar un frame
2. Haz **clic izquierdo** en dos esquinas para cada espacio
3. Presiona **'q'** cuando termines → Se guardarán en la BD automáticamente

### **Paso 4: Monitorear los espacios**
```bash
cd ai_service/src
python parking_monitor.py
```

El sistema leerá las coordenadas desde la BD y comenzará a detectar vehículos.

---

## 🔍 Verificación

### **Ver espacios en la BD (PostgreSQL):**
```sql
SELECT "spaceCode", "status", "x1", "y1", "x2", "y2" 
FROM "parking_spaces" 
ORDER BY "spaceCode";
```

### **Ver espacios desde el backend:**
```bash
curl http://localhost:3000/parking/spaces
```

---

## ⚠️ Notas Importantes

1. **El backend DEBE estar corriendo** antes de ejecutar `draw_spots.py`
2. **Los archivos JSON siguen existiendo** como respaldo por si falla la conexión a la BD
3. **Las coordenadas se guardan en píxeles** relativos a la resolución 640x480
4. **El monitor prioriza la BD** sobre los archivos JSON
5. **Cada vez que ejecutas draw_spots.py se BORRAN todos los espacios anteriores**

---

## 🐛 Solución de Problemas

### **Error: "No se pudo conectar con la base de datos"**
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa las variables de entorno en `backend/.env`

### **Error: "No se pudieron cargar las plazas desde la BD"**
- Verifica la conexión a Oracle Database
- El sistema intentará cargar desde JSON como respaldo

### **Error: "No se pudo abrir la cámara"**
- Ejecuta `python test_camera.py` para diagnosticar
- Verifica que `/dev/video0` esté disponible (Linux)

---

## 📂 Archivos Modificados

### **Backend:**
- ✅ `parking.entity.ts` - Agregadas coordenadas (x1, y1, x2, y2)
- ✅ `parking.service.ts` - Métodos `deleteAllSpaces()` y `createSpaceWithCoords()`
- ✅ `parking.controller.ts` - Endpoints DELETE `/spaces` y POST `/spaces/with-coords`

### **IA Service:**
- ✅ `draw_spots.py` - Conexión con API del backend
- ✅ `parking_monitor.py` - Lee coordenadas desde BD
- ✅ `config/db_config.py` - Configuración de endpoints
- ✅ `requirements.txt` - Agregado `python-dotenv`

---

## 🎉 Ventajas del Nuevo Sistema

✅ **Una sola fuente de verdad**: La BD es la autoridad
✅ **Sin sincronización manual**: Todo automático
✅ **Persistencia**: Las coordenadas no se pierden
✅ **Escalable**: Fácil agregar más cámaras/espacios
✅ **Respaldo JSON**: Si falla la BD, usa archivos locales

---

**¡Listo para usar! 🚀**
