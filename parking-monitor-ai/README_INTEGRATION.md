# Smart Park - Sistema de Monitoreo con IA

Este módulo de IA detecta automáticamente la ocupación de espacios de estacionamiento usando visión por computadora (YOLO) y actualiza la base de datos PostgreSQL compartida con el backend.

## 🔄 Integración con el Backend

El sistema de IA ahora está **completamente integrado** con el backend NestJS:

- **Base de datos compartida**: PostgreSQL (mismo que el backend)
- **Actualización directa**: Modifica la tabla `parking_spaces` en tiempo real
- **Eventos históricos**: Crea registros en `occupancy_events`
- **Frontend sincronizado**: Los cambios se reflejan automáticamente en el frontend Vue

## 📋 Requisitos Previos

1. **Python 3.8+**
2. **PostgreSQL** corriendo (mismo servidor que el backend)
3. **Cámara web** conectada o archivo de video para procesar

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
cd parking-monitor-ai
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `parking-monitor-ai` (o exporta las variables):

```bash
# Configuración PostgreSQL (debe coincidir con el backend)
DB_HOST=localhost
DB_PORT=5433
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=parkingdb
```

### 3. Configurar el Mapeo de Plazas

Edita el archivo `config/spot_mapping.json` para mapear los IDs numéricos de las plazas detectadas por la IA a los códigos del backend:

```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

**Importante**: 
- Las claves (`"1"`, `"2"`, etc.) corresponden a los IDs en `config/parking_spots.json`
- Los valores (`"A-01"`, `"A-02"`, etc.) deben existir en la tabla `parking_spaces` del backend

### 4. Verificar Plazas en el Backend

Antes de ejecutar el sistema de IA, asegúrate de que los espacios de estacionamiento existan en el backend:

```bash
# Desde el backend, puedes crear espacios con:
curl -X POST http://localhost:3000/parking/spaces/multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 4}'
```

O usa el frontend en la sección de **Configuración → Espacios**.

## 🚀 Ejecución

### Opción 1: Con Cámara Web

```bash
cd src
python parking_monitor.py
```

### Opción 2: Con Video Grabado

Edita `parking_monitor.py` y cambia el video source:

```python
if __name__ == "__main__":
    main("ruta/al/video.mp4")  # En lugar de main(0)
```

## 🔍 Funcionamiento

1. **Detección**: YOLO detecta vehículos en el frame de la cámara
2. **Análisis**: Determina qué plazas están ocupadas según las coordenadas configuradas
3. **Mapeo**: Convierte el ID numérico (1, 2, 3...) al código del backend (A-01, A-02...)
4. **Actualización BD**: 
   - Actualiza `parking_spaces.status` (free/occupied)
   - Crea evento en `occupancy_events` si hubo cambio
5. **Frontend**: El frontend recibe los cambios automáticamente en el siguiente polling

## 📊 Salida en Consola

```
[INFO] Mapeo de plazas cargado: {1: 'A-01', 2: 'A-02', 3: 'A-03', 4: 'A-04'}
[INFO] Cámara iniciada (640x480). Presiona 'q' para salir.

[INFO] Plaza 1: 🟩 LIBRE
[INFO] Plaza 2: ✅ OCUPADA
[INFO] Plaza 3: 🟩 LIBRE
[INFO] Plaza 4: ✅ OCUPADA

[INFO] ✅ Actualizado A-02 (a1b2c3d4...): free → occupied
[INFO] ℹ️  A-01: Sin cambios (free)
[INFO] Estado sincronizado con PostgreSQL correctamente.
```

## 🛠️ Solución de Problemas

### Error: "No se encontró el UUID para A-XX"

**Causa**: El código de espacio no existe en la base de datos del backend.

**Solución**: Crea los espacios desde el backend o frontend, o ajusta `config/spot_mapping.json`.

### Error: "connection refused"

**Causa**: PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución**: 
1. Verifica que el backend esté corriendo con `docker-compose up` (si usas Docker)
2. Confirma las variables de entorno `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### No se actualizan los datos en el frontend

**Causa**: El frontend hace polling cada X segundos.

**Solución**: Espera unos segundos o fuerza la actualización en el navegador.

## 📁 Archivos de Configuración

- `config/parking_spots.json`: Coordenadas de las plazas en el frame de video
- `config/spot_mapping.json`: Mapeo ID numérico → spaceCode del backend
- `src/parking_monitor.py`: Script principal de monitoreo

## 🔗 Flujo de Datos

```
Cámara → YOLO → Detección → PostgreSQL → Backend API → Frontend Vue
                    ↓
            Plazas ocupadas/libres
```

## 📝 Notas Importantes

- El sistema actualiza la BD cada `FRAME_SKIP` frames (por defecto cada 2 frames)
- Solo se crean eventos en `occupancy_events` cuando hay **cambios reales** de estado
- El sistema usa los mismos UUIDs que el backend para garantizar consistencia
- La tabla antigua `parking_status` de MySQL ya no se usa

## 🎯 Próximos Pasos

Una vez configurado y ejecutando:

1. ✅ Inicia el backend: `cd parking-iot-system-main && npm run start:dev`
2. ✅ Inicia el frontend: `cd SmartParking-master && npm run dev`
3. ✅ Inicia el monitor de IA: `cd parking-monitor-ai/src && python parking_monitor.py`
4. 🎉 Abre el frontend en el navegador y observa los cambios en tiempo real

---

**Desarrollado por**: Smart Park Team
**Tecnologías**: Python, OpenCV, YOLO, PostgreSQL, NestJS, Vue.js
