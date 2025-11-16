# 🚗 Guía Completa: Configurar Espacios de Estacionamiento

## 📋 Resumen del Flujo

```
1. Backend crea espacios en Oracle DB → (A-01, A-02, A-03, A-04)
2. Dibujar puntos con draw_spots.py → config/parking_spots.json
3. Mapear IDs a códigos → config/spot_mapping.json
4. Ejecutar parking_monitor.py → Actualiza Oracle DB
5. Frontend consulta Backend → Muestra cambios en tiempo real
```

---

## 🔧 PASO 1: Preparar Base de Datos

### 1.1 Iniciar Oracle Database

```bash
cd /home/iurem/Code/smart-park
docker-compose up -d oracle
```

Espera ~30 segundos y verifica:
```bash
docker logs parking-db | tail -20
```

Debe decir: `DATABASE IS READY TO USE!`

### 1.2 Iniciar Backend

```bash
cd /home/iurem/Code/smart-park/backend
npm install  # Solo la primera vez
npm start
```

Espera hasta ver: `Nest application successfully started`

### 1.3 Crear Espacios en la BD

Abre otra terminal y ejecuta:

```bash
curl -X POST http://localhost:3000/parking/spaces/multiple \
  -H "Content-Type: application/json" \
  -d '{"count": 4}'
```

Esto crea 4 espacios con códigos: `A-01`, `A-02`, `A-03`, `A-04`

**Verificar que se crearon:**
```bash
curl http://localhost:3000/parking/spaces | jq
```

Deberías ver algo como:
```json
[
  {
    "id": "uuid-1",
    "spaceCode": "A-01",
    "status": "unknown",
    ...
  },
  {
    "id": "uuid-2",
    "spaceCode": "A-02",
    "status": "unknown",
    ...
  },
  ...
]
```

✅ **Anota los códigos** (A-01, A-02, A-03, A-04) - los necesitarás más adelante.

---

## 🎨 PASO 2: Dibujar Zonas de Estacionamiento

### 2.1 Activar entorno Python

```bash
cd /home/iurem/Code/smart-park/ai_service
source venv/bin/activate  # Si usas venv
# o
conda activate smart-park  # Si usas conda
```

### 2.2 Ejecutar herramienta de dibujo

```bash
cd src
python draw_spots.py
```

### 2.3 Usar la interfaz gráfica

Se abrirá una ventana con la imagen de tu cámara:

1. **Presiona 'c'** para capturar un frame fijo
2. **Aparecerá ventana "Define Spots"**
3. **Para cada espacio:**
   - Haz **clic en esquina superior izquierda**
   - Haz **clic en esquina inferior derecha**
   - Verás un rectángulo verde con el número del espacio
4. **Repite** para definir 4 espacios (IDs: 1, 2, 3, 4)
5. **Presiona 'q'** cuando termines

### 2.4 Verificar archivo generado

```bash
cat ../config/parking_spots.json
```

Debe verse así:
```json
[
    {
        "id": 1,
        "coords": [[122, 74], [294, 197]]
    },
    {
        "id": 2,
        "coords": [[314, 199], [471, 77]]
    },
    {
        "id": 3,
        "coords": [[313, 318], [469, 219]]
    },
    {
        "id": 4,
        "coords": [[122, 219], [293, 320]]
    }
]
```

✅ **Archivo guardado:** `config/parking_spots.json`

---

## 🔗 PASO 3: Mapear IDs a Códigos de BD

### 3.1 Editar archivo de mapeo

```bash
cd /home/iurem/Code/smart-park/ai_service
nano config/spot_mapping.json  # o usa tu editor favorito
```

### 3.2 Configurar mapeo

**Importante:** Los números (1, 2, 3, 4) son los IDs que dibujaste en `draw_spots.py`.
Los códigos (A-01, A-02, etc.) deben coincidir **exactamente** con los de la base de datos.

```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

**Regla:**
- `"1"` = primer espacio que dibujaste → `"A-01"` en la BD
- `"2"` = segundo espacio que dibujaste → `"A-02"` en la BD
- etc.

Guarda el archivo (Ctrl+O, Enter, Ctrl+X en nano).

---

## ✅ PASO 4: Verificar Configuración

```bash
cd /home/iurem/Code/smart-park/ai_service/src
python verify_setup.py
```

Debe mostrar:
```
✅ Conexión exitosa a Oracle Database
✅ Espacios encontrados:
  - A-01 (uuid-1) - Status: unknown
  - A-02 (uuid-2) - Status: unknown
  - A-03 (uuid-3) - Status: unknown
  - A-04 (uuid-4) - Status: unknown
✅ Mapeo verificado correctamente
✅ Archivo parking_spots.json existe
```

Si hay errores, revisa:
- Oracle DB está corriendo (`docker ps`)
- Backend está corriendo (`curl http://localhost:3000/health`)
- Los códigos en `spot_mapping.json` coinciden exactamente con los de la BD

---

## 🚀 PASO 5: Ejecutar Monitor de IA

### 5.1 Iniciar monitor

```bash
cd /home/iurem/Code/smart-park/ai_service/src
python parking_monitor.py
```

### 5.2 Qué esperar

```
[INFO] Sistema operativo: Linux
[INFO] Backend de cámara: V4L2 (Linux)
[INFO] Mapeo de plazas cargado: {1: 'A-01', 2: 'A-02', 3: 'A-03', 4: 'A-04'}
[INFO] Cámara iniciada (640x480). Presiona 'q' para salir.

[INFO] Plaza 1: 🟩 LIBRE
[INFO] Plaza 2: 🟩 LIBRE
[INFO] Plaza 3: 🟩 LIBRE
[INFO] Plaza 4: 🟩 LIBRE
[INFO] Estado sincronizado con Oracle Database correctamente.
```

### 5.3 Probar detección

1. **Coloca un objeto** (juguete, caja, etc.) en una de las zonas que dibujaste
2. **Espera ~2 segundos**
3. Deberías ver:
   ```
   [INFO] Plaza 2: ✅ OCUPADA
   [INFO] ✅ Actualizado A-02 (uuid...): unknown → occupied
   [INFO] Estado sincronizado con Oracle Database correctamente.
   ```
4. **Verifica en la ventana visual**: el cuadro debe cambiar de verde a rojo

### 5.4 Verificar actualización en BD

Abre otra terminal:
```bash
curl http://localhost:3000/parking/spaces | jq '.[] | select(.spaceCode == "A-02")'
```

Debe mostrar:
```json
{
  "id": "uuid-2",
  "spaceCode": "A-02",
  "status": "occupied",  ← CAMBIÓ!
  "updatedAt": "2025-11-16T..."
}
```

---

## 🖥️ PASO 6: Ver en Frontend

### 6.1 Iniciar frontend

```bash
cd /home/iurem/Code/smart-park/frontend
npm install  # Solo la primera vez
npm run dev
```

### 6.2 Abrir navegador

Abre: `http://localhost:5173` (o el puerto que muestre)

### 6.3 Ver espacios

1. **Login** con tus credenciales
2. **Navega** a la sección de Espacios/Dashboard
3. **Deberías ver:**
   - A-01: LIBRE (verde)
   - A-02: OCUPADO (rojo) ← El que ocupaste
   - A-03: LIBRE (verde)
   - A-04: LIBRE (verde)

### 6.4 Probar cambios en tiempo real

1. **Retira el objeto** del espacio A-02
2. **Espera 5-10 segundos** (el frontend hace polling cada 5 seg)
3. **A-02 debe cambiar a LIBRE** automáticamente

---

## 🔍 Cómo Funciona el Flujo Completo

```
┌─────────────┐
│   Cámara    │ Captura video
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  parking_monitor.py (IA)            │
│  - Detecta vehículos con YOLO       │
│  - Lee parking_spots.json (coords)  │
│  - Calcula ocupación                │
│  - Lee spot_mapping.json (IDs→Code) │
└──────────┬──────────────────────────┘
           │
           │ UPDATE parking_spaces
           │ WHERE spaceCode = 'A-02'
           │ SET status = 'occupied'
           ▼
┌─────────────────────────┐
│   Oracle Database       │
│   Tabla: parking_spaces │
│   - A-01: free          │
│   - A-02: occupied ←    │
│   - A-03: free          │
│   - A-04: free          │
└──────────┬──────────────┘
           │
           │ GET /parking/spaces
           ▼
┌─────────────────────────┐
│  Backend NestJS         │
│  - Lee de Oracle DB     │
│  - Sirve API REST       │
└──────────┬──────────────┘
           │
           │ Polling cada 5 seg
           ▼
┌─────────────────────────┐
│  Frontend Vue.js        │
│  - Muestra espacios     │
│  - Actualiza colores    │
│  - Muestra historial    │
└─────────────────────────┘
```

---

## 📁 Archivos Clave

| Archivo | Propósito | Quién lo crea |
|---------|-----------|---------------|
| `config/parking_spots.json` | Coordenadas (x,y) de cada espacio | `draw_spots.py` |
| `config/spot_mapping.json` | Mapeo ID → spaceCode | Tú manualmente |
| Oracle DB tabla `parking_spaces` | Estado actual de cada espacio | Backend + IA |
| Oracle DB tabla `occupancy_events` | Historial de cambios | IA monitor |

---

## 🐛 Troubleshooting

### Error: "No se pudo abrir la cámara"
```bash
# Verificar cámaras disponibles
python test_camera.py
```

### Error: "No se encontró el parking space con código A-XX"
- Verifica que el espacio existe en BD: `curl http://localhost:3000/parking/spaces`
- Revisa `spot_mapping.json` - los códigos deben coincidir **exactamente**

### Error: "Oracle Database connection failed"
- Verifica Docker: `docker ps | grep parking-db`
- Verifica credenciales en las variables de entorno del monitor

### Frontend no se actualiza
- El polling es cada 5 segundos, **espera**
- Verifica consola del navegador (F12)
- Confirma backend responde: `curl http://localhost:3000/parking/spaces`

### YOLO no detecta objetos
- Verifica iluminación
- Usa objetos más grandes
- Ajusta `conf` threshold en `parking_monitor.py` línea ~51 (prueba 0.15 en lugar de 0.25)

---

## 🎯 Checklist Final

- [ ] Oracle DB corriendo (puerto 1521)
- [ ] Backend corriendo (puerto 3000)
- [ ] Frontend corriendo (puerto 5173)
- [ ] 4 espacios creados en BD (A-01 a A-04)
- [ ] `parking_spots.json` tiene 4 zonas dibujadas
- [ ] `spot_mapping.json` mapea IDs a códigos correctamente
- [ ] `verify_setup.py` pasa todas las verificaciones
- [ ] `parking_monitor.py` detecta cambios
- [ ] Base de datos se actualiza
- [ ] Frontend muestra cambios en ~5 segundos

---

## 📞 Comandos Útiles

```bash
# Ver logs de Oracle
docker logs parking-db -f

# Verificar backend
curl http://localhost:3000/health

# Ver todos los espacios
curl http://localhost:3000/parking/spaces | jq

# Ver estado de un espacio específico
curl http://localhost:3000/parking/spaces | jq '.[] | select(.spaceCode == "A-01")'

# Probar detección de cámara
python test_camera.py

# Verificar configuración IA
cd ai_service/src
python verify_setup.py
```

---

**¡Listo!** Ahora tienes un sistema completo de detección de ocupación en tiempo real. 🎉
