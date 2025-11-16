# 🚗 Smart Park - AI Parking Monitor

Sistema de detección inteligente de ocupación de espacios de estacionamiento usando visión por computadora (YOLO) integrado con backend NestJS y frontend Vue.js.

## 🎯 Características

- ✅ **Detección en tiempo real** con YOLO v8
- ✅ **Integración directa** con PostgreSQL
- ✅ **Sincronización automática** con backend y frontend
- ✅ **Historial de eventos** para análisis
- ✅ **Interfaz visual** con OpenCV
- ✅ **Multi-plaza** con configuración flexible

## 🏗️ Arquitectura

```
Cámara → YOLO Detection → PostgreSQL ← Backend API ← Frontend Vue
                              ↓
                      Actualización en
                       Tiempo Real
```

## 📋 Requisitos

- Python 3.8 o superior
- PostgreSQL (compartido con backend)
- Cámara web o archivo de video
- Modelo YOLO entrenado (incluido)

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar repositorio (si aún no lo has hecho)
cd parking-monitor-ai

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL
```

### 2. Configuración

Edita `config/spot_mapping.json` para mapear tus plazas:

```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

### 3. Verificación

```bash
# Verifica que todo esté configurado correctamente
cd src
python verify_setup.py
```

### 4. Ejecución

**Linux/Mac:**
```bash
bash start.sh
```

**Windows:**
```bash
start.bat
```

**Manual:**
```bash
cd src
python parking_monitor.py
```

## 📚 Documentación Completa

- **[🔗 Guía de Integración](README_INTEGRATION.md)** - Cómo funciona la integración con backend/frontend
- **[🔄 Guía de Migración](MIGRATION_GUIDE.md)** - Cambios desde versión anterior (MySQL → PostgreSQL)
- **[✅ Checklist de Instalación](INSTALLATION_CHECKLIST.md)** - Lista paso a paso

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)

```bash
DB_HOST=localhost        # Host de PostgreSQL
DB_PORT=5433            # Puerto (5433 por defecto en docker-compose)
DB_USER=admin           # Usuario de la BD
DB_PASSWORD=admin123    # Contraseña
DB_NAME=parkingdb       # Nombre de la base de datos
```

### Ajustar Detección (parking_monitor.py)

```python
# Línea ~12
FRAME_SKIP = 2              # Procesar cada N frames (menor = más rápido, más CPU)

# Línea ~13
CAMERA_RESOLUTION = (640, 480)  # Resolución de cámara

# Línea ~78
if overlap > 0.05:          # Umbral de solapamiento (menor = más sensible)
```

## 📊 Monitoreo

### Salida en Consola

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

### Ventana Visual

La ventana de OpenCV muestra:
- 🟦 **Cuadros azules**: Vehículos detectados por YOLO
- 🟩 **Cuadros verdes**: Plazas libres
- 🟥 **Cuadros rojos**: Plazas ocupadas

## 🛠️ Solución de Problemas

### Error de Conexión PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Verificar credenciales
python src/verify_setup.py
```

### No se Detectan Vehículos

1. Verifica iluminación de la cámara
2. Ajusta `conf` threshold (línea ~51 en parking_monitor.py)
3. Revisa que el modelo YOLO esté entrenado correctamente

### Frontend No Muestra Cambios

1. Espera 5-10 segundos (polling interval)
2. Verifica que backend esté corriendo
3. Confirma que los spaceCodes en `spot_mapping.json` existan en la BD

## 📁 Estructura del Proyecto

```
parking-monitor-ai/
├── config/
│   ├── parking_spots.json       # Coordenadas de plazas en video
│   ├── spot_mapping.json        # Mapeo ID → spaceCode
│   └── parking_status.json      # Cache de estado (opcional)
├── src/
│   ├── parking_monitor.py       # Script principal ⭐
│   ├── verify_setup.py          # Verificación de configuración
│   ├── draw_spots.py            # Herramienta para definir coordenadas
│   └── utils.py                 # Utilidades
├── runs/
│   └── train/
│       └── toycar_detector_finalsafe4/
│           └── weights/
│               └── best.pt      # Modelo YOLO entrenado
├── requirements.txt             # Dependencias Python
├── .env.example                # Plantilla de configuración
├── start.sh                    # Inicio rápido (Linux/Mac)
├── start.bat                   # Inicio rápido (Windows)
├── README.md                   # Este archivo
├── README_INTEGRATION.md       # Guía de integración completa
├── MIGRATION_GUIDE.md          # Guía de migración
└── INSTALLATION_CHECKLIST.md   # Checklist de instalación
```

## 🔗 Integración con el Sistema Completo

Este proyecto es parte del sistema **Smart Park** que incluye:

1. **Backend (NestJS)**: API REST y gestión de datos
   - Ubicación: `../parking-iot-system-main/`
   - Puerto: 3000
   
2. **Frontend (Vue.js)**: Interfaz de usuario
   - Ubicación: `../SmartParking-master/`
   - Puerto: 5173 (o configurado)
   
3. **IA Monitor (Este proyecto)**: Detección visual
   - Actualiza directamente PostgreSQL
   - Se refleja automáticamente en frontend

### Orden de Inicio Recomendado

```bash
# 1. Backend + PostgreSQL
cd parking-iot-system-main
docker-compose up -d postgres
npm run start:dev

# 2. Frontend
cd ../SmartParking-master
npm run dev

# 3. Monitor IA
cd ../parking-monitor-ai
bash start.sh  # o start.bat en Windows
```

## 🎓 Entrenamiento del Modelo

Si necesitas entrenar tu propio modelo YOLO:

```bash
cd src
python train_model.py
```

Ver `datasets/` para el formato de datos requerido.

## 📸 Configurar Nuevas Plazas

Para definir las coordenadas de tus plazas:

```bash
cd src
python draw_spots.py
```

Esto abrirá una interfaz gráfica donde puedes:
1. Seleccionar área de cada plaza
2. Guardar coordenadas en `config/parking_spots.json`

## 🤝 Contribuir

Mejoras bienvenidas! Áreas de interés:

- Optimización de rendimiento
- Soporte para más tipos de vehículos
- Integración con otros backends
- Mejora de algoritmos de detección

## 📄 Licencia

Este proyecto es parte del sistema Smart Park.

## 🆘 Soporte

Para problemas o preguntas:

1. Revisa [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)
2. Ejecuta `python src/verify_setup.py` para diagnóstico
3. Revisa [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) para detalles técnicos

---

**Desarrollado con** 🚗 **por el equipo Smart Park**

**Tecnologías**: Python • OpenCV • YOLO • PostgreSQL • NestJS • Vue.js
