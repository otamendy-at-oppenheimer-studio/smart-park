# 🔄 Guía de Migración - Smart Park AI Integration

## Cambios Realizados

Este documento explica los cambios realizados para integrar el sistema de IA con el backend NestJS y el frontend Vue.

---

## 📋 Resumen de Cambios

### ❌ **ANTES** (Sistema Desconectado)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│    IA       │──────▶│   MySQL     │       │  Backend    │
│   (Python)  │       │ (Separado)  │       │  (NestJS)   │
│             │       │             │       │             │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                    │
                                              ┌─────▼──────┐
                                              │ PostgreSQL │
                                              │ (Separado) │
                                              └─────┬──────┘
                                                    │
                                              ┌─────▼──────┐
                                              │  Frontend  │
                                              │   (Vue)    │
                                              └────────────┘

❌ Problemas:
- Dos bases de datos diferentes (MySQL y PostgreSQL)
- Sin sincronización entre IA y Backend
- Frontend no muestra detecciones de IA
- Datos duplicados e inconsistentes
```

### ✅ **AHORA** (Sistema Integrado)

```
┌─────────────┐
│    IA       │
│  (Python)   │
│   + YOLO    │
└──────┬──────┘
       │
       │ psycopg2 (DIRECTO)
       │
       ▼
┌─────────────────────────────┐
│       PostgreSQL            │
│  ┌─────────────────────┐   │
│  │  parking_spaces     │◀──┼─┐
│  │  occupancy_events   │   │ │
│  └─────────────────────┘   │ │
└─────────────────────────────┘ │
       ▲                        │
       │ TypeORM                │ REST API
       │                        │
┌──────┴──────┐          ┌──────┴──────┐
│   Backend   │          │  Frontend   │
│  (NestJS)   │◀────────▶│   (Vue)     │
└─────────────┘  HTTP    └─────────────┘

✅ Ventajas:
- Una sola base de datos compartida
- Actualizaciones en tiempo real
- Frontend refleja detecciones de IA
- Consistencia total de datos
```

---

## 🔧 Cambios Técnicos Detallados

### 1. **Dependencias** (`requirements.txt`)

**Agregado:**
```python
psycopg2-binary  # Conector PostgreSQL
```

**Removido:**
```python
mysql-connector-python  # Ya no se usa MySQL
```

---

### 2. **Configuración de Base de Datos** (`parking_monitor.py`)

**ANTES:**
```python
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "tamayo123",
    "database": "parking_db"
}

import mysql.connector
conn = mysql.connector.connect(**DB_CONFIG)
```

**AHORA:**
```python
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5433")),
    "user": os.environ.get("DB_USER", "admin"),
    "password": os.environ.get("DB_PASSWORD", "admin123"),
    "database": os.environ.get("DB_NAME", "parkingdb")
}

import psycopg2
conn = psycopg2.connect(**DB_CONFIG)
```

---

### 3. **Mapeo de Plazas** (`config/spot_mapping.json`)

**Nuevo archivo creado:**

Este archivo mapea los IDs numéricos (usados en `parking_spots.json`) a los códigos del backend:

```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

**¿Por qué es necesario?**
- El sistema de IA identifica plazas por ID numérico (1, 2, 3, 4)
- El backend usa códigos alfanuméricos (A-01, A-02, etc.)
- Este archivo hace la traducción entre ambos

---

### 4. **Actualización de Base de Datos**

**ANTES:** (MySQL - tabla simple)
```python
def save_to_mysql(status):
    cursor.execute("DELETE FROM parking_status")
    for spot in status:
        cursor.execute(
            "INSERT INTO parking_status (spot_id, occupied, timestamp) VALUES (%s, %s, %s)",
            (spot["id"], int(spot["occupied"]), timestamp)
        )
```

**AHORA:** (PostgreSQL - actualización inteligente)
```python
def save_to_postgresql(status, spot_mapping):
    for spot in status:
        # 1. Obtener spaceCode del mapeo
        space_code = spot_mapping.get(spot["id"])
        
        # 2. Buscar UUID en parking_spaces
        parking_space_uuid = get_parking_space_id(space_code, conn)
        
        # 3. Obtener estado actual
        current_status = get_current_status(parking_space_uuid)
        
        # 4. Solo actualizar si hay cambio
        if current_status != new_status:
            # Actualizar parking_spaces
            update_parking_space(parking_space_uuid, new_status)
            
            # Crear evento histórico
            create_occupancy_event(parking_space_uuid, new_status)
```

**Ventajas:**
- ✅ Solo actualiza cuando hay cambios reales
- ✅ Mantiene historial en `occupancy_events`
- ✅ Usa los mismos UUIDs que el backend
- ✅ Actualiza timestamp automáticamente

---

### 5. **Estructura de Tablas**

#### **PostgreSQL (Backend + IA)**

```sql
-- Tabla principal de espacios
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY,
    "spaceCode" VARCHAR NOT NULL,      -- A-01, A-02, etc.
    status VARCHAR NOT NULL,            -- 'free' | 'occupied' | 'unknown'
    floor VARCHAR,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP              -- Se actualiza automáticamente
);

-- Tabla de eventos históricos
CREATE TABLE occupancy_events (
    id UUID PRIMARY KEY,
    "parkingSpaceId" UUID REFERENCES parking_spaces(id),
    status VARCHAR NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
```

#### **MySQL (Ya no se usa)**

```sql
-- ❌ DEPRECATED - Esta tabla ya no se utiliza
CREATE TABLE parking_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    occupied BOOLEAN NOT NULL,
    timestamp DATETIME NOT NULL
);
```

---

## 📁 Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `config/spot_mapping.json` | Mapeo de IDs a spaceCodes |
| `src/verify_setup.py` | Script de verificación de configuración |
| `.env.example` | Plantilla de variables de entorno |
| `README_INTEGRATION.md` | Documentación de integración |
| `MIGRATION_GUIDE.md` | Este documento |
| `start.sh` | Script de inicio rápido (Linux/Mac) |
| `web/fastapi_receiver_postgres.py` | Servidor opcional con PostgreSQL |

---

## 🔄 Flujo de Datos Actualizado

### Detección de Vehículo

```
1. Cámara captura frame
   ↓
2. YOLO detecta vehículo
   ↓
3. Sistema determina plaza ocupada (ej: plaza ID 2)
   ↓
4. Mapeo: ID 2 → "A-02"
   ↓
5. Consulta BD: SELECT id FROM parking_spaces WHERE spaceCode = 'A-02'
   ↓
6. Obtiene UUID: "a1b2c3d4-..."
   ↓
7. Verifica estado actual: "free"
   ↓
8. Actualiza: UPDATE parking_spaces SET status = 'occupied' WHERE id = UUID
   ↓
9. Crea evento: INSERT INTO occupancy_events (...)
   ↓
10. Backend API automáticamente tiene datos actualizados
   ↓
11. Frontend hace polling (cada 5s) y obtiene cambios
   ↓
12. Usuario ve "Plaza A-02: OCUPADA" en tiempo real
```

---

## 🚀 Pasos de Migración

### Para Usuarios Existentes:

Si ya tenías el sistema anterior funcionando:

1. **Instala nueva dependencia:**
   ```bash
   cd parking-monitor-ai
   pip install psycopg2-binary
   ```

2. **Copia configuración:**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

3. **Crea mapeo de plazas:**
   ```bash
   # Edita config/spot_mapping.json
   # Asegúrate de que los spaceCodes existan en el backend
   ```

4. **Verifica configuración:**
   ```bash
   cd src
   python verify_setup.py
   ```

5. **Inicia el sistema:**
   ```bash
   python parking_monitor.py
   ```

### Para Nuevas Instalaciones:

Sigue el README_INTEGRATION.md completo.

---

## 🐛 Problemas Comunes

### "No se encontró el UUID para A-XX"

**Causa:** El spaceCode no existe en la base de datos.

**Solución:**
```bash
# Opción 1: Crear espacios desde el backend
curl -X POST http://localhost:3000/parking/spaces/multiple \
  -H "Authorization: Bearer TOKEN" \
  -d '{"count": 4}'

# Opción 2: Ajustar spot_mapping.json a los códigos existentes
python src/verify_setup.py  # Ver códigos disponibles
```

### "Connection refused PostgreSQL"

**Causa:** PostgreSQL no está corriendo o credenciales incorrectas.

**Solución:**
```bash
# Si usas Docker (desde parking-iot-system-main):
cd parking-iot-system-main
docker-compose up -d postgres

# Verifica credenciales en .env
# Deben coincidir con docker-compose.yml
```

### "No hay cambios en el frontend"

**Causa:** El frontend hace polling, puede tardar hasta 5 segundos.

**Solución:** Espera unos segundos o fuerza refresh (F5).

---

## 🎯 Ventajas de la Nueva Arquitectura

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Bases de datos** | 2 (MySQL + PostgreSQL) | 1 (PostgreSQL) |
| **Sincronización** | ❌ Manual/Inexistente | ✅ Automática |
| **Latencia** | ⚠️ Alta (no conectado) | ✅ Tiempo real |
| **Historial** | ❌ Solo en MySQL | ✅ En occupancy_events |
| **Frontend** | ❌ No ve detecciones IA | ✅ Integrado |
| **Mantenimiento** | ⚠️ Duplicado | ✅ Centralizado |
| **Escalabilidad** | ⚠️ Limitada | ✅ Mejorada |

---

## 📚 Referencias

- **Backend**: `/parking-iot-system-main/API_FRONTEND_DOCS.md`
- **Frontend**: `/SmartParking-master/src/api/parking.ts`
- **IA**: `/parking-monitor-ai/README_INTEGRATION.md`
- **PostgreSQL Schema**: Ver entidades en `/parking-iot-system-main/src/modules/`

---

## 🆘 Soporte

Si encuentras problemas:

1. Ejecuta `python src/verify_setup.py` para diagnóstico
2. Revisa los logs de PostgreSQL
3. Verifica que backend y frontend estén corriendo
4. Confirma que los spaceCodes en `spot_mapping.json` existen en la BD

---

**Fecha de migración**: Noviembre 2025  
**Versión**: 2.0.0  
**Estado**: ✅ Producción
