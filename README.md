# 🚗 Smart Park - Sistema Integrado de Estacionamiento Inteligente

## 📊 Estado del Proyecto

**Versión:** 3.0.0  
**Estado:** ✅ **MIGRADO A ORACLE DATABASE**  
**Fecha:** Noviembre 2025

---

## 🎯 Resumen Ejecutivo

Smart Park es un sistema completo de gestión de estacionamiento que combina:

- 🤖 **Inteligencia Artificial** (YOLO v8) para detección visual de vehículos
- 🔧 **Backend Robusto** (NestJS + Oracle DB) para gestión de datos
- 🎨 **Frontend Moderno** (Vue.js) para visualización en tiempo real
- 📊 **Base de Datos Unificada** (Oracle Database) para consistencia total

**Novedad v3.0:** El sistema ha sido migrado completamente de PostgreSQL a **Oracle Database** para cumplir con requerimientos externos.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────┐
│   Cámara + YOLO     │  ← Detección visual de vehículos
│   (parking-monitor) │
└──────────┬──────────┘
           │ oracledb (Python)
           ↓
┌──────────────────────────────────┐
│    Oracle Database (Puerto 1521) │  ← Base de datos única
│  ┌───────────────────────────┐  │
│  │ parking_spaces            │  │  ← Espacios de estacionamiento
│  │ occupancy_events          │  │  ← Historial de eventos
│  │ users, sensors, reports   │  │  ← Otros datos
│  └───────────────────────────┘  │
└──────────┬───────────────────────┘
           │ TypeORM
           ↓
┌──────────────────────┐
│   Backend NestJS     │  ← API REST (Puerto 3000)
│   (backend)          │
└──────────┬───────────┘
           │ HTTP/REST
           ↓
┌──────────────────────┐
│   Frontend Vue.js    │  ← Interfaz web (Puerto 5173)
│   (frontend)         │
└──────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
smart-park/
│
├── backend/                        ← 🔧 BACKEND (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── parking/           ← Gestión de espacios
│   │   │   ├── occupancy/         ← Eventos de ocupación
│   │   │   ├── users/             ← Autenticación
│   │   │   └── ...
│   │   └── database/              ← Configuración Oracle
│   ├── docker-compose.yml         ← Oracle Database containerizado
│   ├── init-oracle/               ← Scripts de inicialización
│   └── package.json
│
├── frontend/                       ← 🎨 FRONTEND (Vue.js)
│   ├── src/
│   │   ├── components/            ← Componentes UI
│   │   ├── api/                   ← Llamadas al backend
│   │   └── stores/                ← Estado global (Pinia)
│   └── package.json
│
├── ai_service/                     ← 🤖 INTELIGENCIA ARTIFICIAL (Python)
│   ├── src/
│   │   ├── parking_monitor.py     ← Script principal ⭐
│   │   └── verify_setup.py        ← Verificación
│   ├── config/
│   │   ├── parking_spots.json     ← Coordenadas de plazas
│   │   └── spot_mapping.json      ← Mapeo ID → Código
│   ├── requirements.txt
│   ├── .env                       ← Configuración Oracle
│   ├── start.sh / start.bat       ← Scripts de inicio
│   └── 📚 Documentación completa
│
├── INICIO_RAPIDO.md               ← 🚀 EMPIEZA AQUÍ
└── MIGRACION_ORACLE.md            ← 📖 GUÍA DE MIGRACIÓN ⭐ NUEVO
```

---

## 🚀 Inicio Rápido

### ⚠️ IMPORTANTE: Migración a Oracle Database

**Si venías usando PostgreSQL**, lee primero [`MIGRACION_ORACLE.md`](MIGRACION_ORACLE.md) para entender los cambios.

### Para Usuarios Nuevos

**Lee primero:** [`INICIO_RAPIDO.md`](INICIO_RAPIDO.md) - Guía paso a paso completa

### Para Desarrolladores

**Orden de inicio:**

```bash
# 1. Backend + Oracle Database
cd backend
docker-compose up -d oracle  # Tarda 1-2 min la primera vez
npm install
npm run start:dev

# 2. Frontend
cd ../frontend
npm run dev

# 3. Monitor IA (después de configurar)
cd ../ai_service
pip install -r requirements.txt
bash start.sh  # o start.bat en Windows
```

---

## 📚 Documentación

### ⭐ Migración a Oracle
- **[🔄 MIGRACION_ORACLE.md](MIGRACION_ORACLE.md)** - Guía completa de migración PostgreSQL → Oracle

### General
- **[🚀 INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Guía paso a paso para usuarios

### Backend
- **API_FRONTEND_DOCS.md** - Documentación completa de la API REST
- Ubicación: `backend/`

### Frontend
- **README.md** - Información del frontend Vue.js
- Ubicación: `frontend/`

### IA
- **[README.md](ai_service/README.md)** - Introducción
- **[README_INTEGRATION.md](ai_service/README_INTEGRATION.md)** - Guía completa de integración
- **[MIGRATION_GUIDE.md](ai_service/MIGRATION_GUIDE.md)** - Cambios técnicos
- **[INSTALLATION_CHECKLIST.md](ai_service/INSTALLATION_CHECKLIST.md)** - Lista de verificación
- **[RESUMEN_CAMBIOS.md](ai_service/RESUMEN_CAMBIOS.md)** - Resumen de cambios realizados

---

## ✨ Características Principales

### 🤖 Detección Inteligente
- ✅ Detección automática de vehículos con YOLO v8
- ✅ Configuración flexible de zonas de estacionamiento
- ✅ Ajuste de sensibilidad y umbrales
- ✅ Soporte para múltiples cámaras (futuro)

### 🔧 Backend Robusto
- ✅ API REST completa (NestJS)
- ✅ Autenticación JWT
- ✅ Control de acceso por roles (Admin/User)
- ✅ Base de datos Oracle Database
- ✅ Migraciones automáticas con TypeORM

### 🎨 Frontend Moderno
- ✅ Interfaz responsiva (Vue.js + Tailwind CSS)
- ✅ Dashboard en tiempo real
- ✅ Gestión de espacios
- ✅ Historial de eventos
- ✅ Reportes y estadísticas
- ✅ Panel de administración

### 📊 Integración Completa
- ✅ IA actualiza directamente Oracle Database
- ✅ Sincronización en tiempo real
- ✅ Historial completo de eventos
- ✅ Una sola fuente de verdad (Oracle)

---

## 🔄 Flujo de Trabajo

### Detección de Vehículo

1. 📹 **Cámara captura** el estacionamiento
2. 🤖 **YOLO detecta** vehículos en tiempo real
3. 🗺️ **Sistema mapea** plaza numérica (1, 2, 3) a código backend (A-01, A-02, A-03)
4. 💾 **Actualiza Oracle Database** directamente:
   - Modifica `parking_spaces.status`
   - Crea evento en `occupancy_events`
5. 🔌 **Backend** tiene datos actualizados inmediatamente
6. 🌐 **Frontend** obtiene cambios en ~5 segundos (polling)
7. 👤 **Usuario** ve estado actualizado en tiempo real

### Consulta de Estado

1. 👤 Usuario abre el frontend
2. 🌐 Frontend hace `GET /parking/spaces`
3. 🔌 Backend consulta Oracle Database
4. 💾 Oracle devuelve estados actuales (actualizados por IA)
5. 🎨 Frontend renderiza plazas con estado correcto

---

## 🎯 Casos de Uso

### 1. Estacionamiento Público
- Mostrar disponibilidad en tiempo real
- Reducir tiempo de búsqueda de plaza
- Generar reportes de ocupación

### 2. Estacionamiento Privado (Empresas)
- Control de acceso
- Estadísticas de uso
- Optimización de espacios

### 3. Centros Comerciales
- Guiar a usuarios a plazas libres
- Analytics de flujo de vehículos
- Integración con apps móviles

---

## 🔧 Tecnologías Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para Oracle Database
- **Oracle Database 23c Free** - Base de datos enterprise
- **JWT** - Autenticación
- **Docker** - Contenedorización

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Pinia** - State management
- **TypeScript** - Tipado estático

### IA
- **Python 3.8+** - Lenguaje
- **YOLO v8** - Detección de objetos
- **OpenCV** - Procesamiento de video
- **oracledb** - Conector Oracle nativo
- **NumPy** - Procesamiento numérico

---

## ⚙️ Configuración Rápida

### 1. Requisitos Previos
- Node.js 16+ y npm
- Python 3.8+
- Docker (recomendado para PostgreSQL)
- Cámara web

### 2. Configuración de Variables de Entorno

**Backend** (`.env` en `backend/`):
```bash
DB_HOST=localhost
DB_PORT=1521
DB_USER=parkingapp
DB_PASSWORD=admin123
DB_SID=FREEPDB1
JWT_SECRET=your-secret-key
```

**IA** (`.env` en `ai_service/`):
```bash
DB_HOST=localhost
DB_PORT=1521
DB_USER=parkingapp
DB_PASSWORD=admin123
DB_SID=FREEPDB1
```

**⚠️ Importante:** Las credenciales deben coincidir en ambos proyectos.

### 3. Mapeo de Plazas

Edita `ai_service/config/spot_mapping.json`:
```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

---

## 🧪 Testing

### Verificar Backend
```bash
curl http://localhost:3000/parking/spaces
```

### Verificar Frontend
Navega a `http://localhost:5173` y haz login

### Verificar IA
```bash
cd parking-monitor-ai/src
python verify_setup.py
```

---

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verifica Oracle Database
docker ps | grep parking-db

# Ver logs de Oracle
docker logs -f parking-db

# Reinicia Oracle
cd backend
docker-compose restart oracle
```

### IA no conecta a BD
```bash
# Verifica configuración
cd ai_service/src
python verify_setup.py
```

### Frontend no se actualiza
- Espera 10 segundos (polling interval)
- Verifica que el backend responda
- Revisa consola del navegador (F12)

**Más detalles:** Ver [`MIGRACION_ORACLE.md`](MIGRACION_ORACLE.md) para troubleshooting específico de Oracle.

---

## 📊 Métricas del Sistema

Cuando todo funciona correctamente:

- ⚡ **Latencia de detección:** <100ms (depende del hardware)
- 🔄 **Actualización frontend:** 5-10 segundos (configurable)
- 💾 **Consistencia de datos:** 100% (una sola BD)
- 📈 **Escalabilidad:** Soporta múltiples cámaras/zonas
- 🎯 **Precisión YOLO:** Depende del modelo entrenado

---

## 🎓 Para Desarrolladores

### Extender el Sistema

**Agregar nueva plaza:**
1. Crea el espacio en backend (API o frontend)
2. Agrega coordenadas en `parking_spots.json`
3. Actualiza `spot_mapping.json`

**Cambiar umbral de detección:**
Edita `parking_monitor.py` línea ~78:
```python
if overlap > 0.05:  # Ajusta este valor
```

**Cambiar intervalo de polling frontend:**
Edita el componente Vue correspondiente (ej. `Dashboard.vue`)

---

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Áreas de mejora:

- [ ] WebSockets para actualizaciones en tiempo real
- [ ] App móvil nativa
- [ ] Múltiples cámaras simultáneas
- [ ] Machine Learning para predicción de ocupación
- [ ] Integración con sistemas de pago

---

## 📝 Changelog

### v3.0.0 (Noviembre 2025) - MIGRACIÓN A ORACLE DATABASE
- ✅ Migración completa de PostgreSQL a Oracle Database 23c Free
- ✅ Backend NestJS adaptado para Oracle (TypeORM)
- ✅ AI Service migrado a driver `oracledb`
- ✅ Sintaxis SQL actualizada (placeholders `:1` en vez de `%s`)
- ✅ Tipo de dato `jsonb` → `simple-json`
- ✅ Docker Compose actualizado con imagen Oracle
- ✅ Documentación completa de migración
- ✅ Scripts de verificación actualizados

### v2.0.0 (Noviembre 2025) - INTEGRACIÓN COMPLETA
- ✅ Migración de MySQL a PostgreSQL en módulo IA
- ✅ Integración directa IA ↔ Backend
- ✅ Actualizaciones en tiempo real
- ✅ Mapeo flexible de plazas
- ✅ Scripts de verificación y configuración
- ✅ Documentación completa

### v1.0.0 (Octubre 2025)
- ✅ Backend NestJS con PostgreSQL
- ✅ Frontend Vue.js
- ✅ Sistema de IA independiente (MySQL)
- ⚠️ Sin integración entre componentes

---

## 📞 Contacto

Para soporte, consultas o contribuciones:

1. Revisa la documentación en cada módulo
2. Ejecuta scripts de verificación (`verify_setup.py`)
3. Consulta `INICIO_RAPIDO.md` para guía paso a paso

---

## 📄 Licencia

Este proyecto es parte del sistema Smart Park.

---

## 🎉 Estado Actual

**✅ SISTEMA COMPLETAMENTE FUNCIONAL CON ORACLE DATABASE**

- Backend: ✅ Funcionando con Oracle
- Frontend: ✅ Funcionando
- IA: ✅ Integrado con Oracle
- Base de Datos: ✅ Oracle Database 23c Free
- Tiempo Real: ✅ Activo

**¡Listo para usar! 🚗🎉**

---

**Última actualización:** Noviembre 2025  
**Versión:** 3.0.0  
**Base de Datos:** Oracle Database 23c Free  
**Mantenedor:** Smart Park Team
