# Sistema de Auditoría - Smart Parking System

## Descripción General

El sistema de auditoría implementa un mecanismo automático y transparente para registrar todos los cambios realizados en las tablas principales de la base de datos. Utiliza **triggers de Oracle** para capturar automáticamente las operaciones INSERT, UPDATE y DELETE, garantizando que ningún cambio pase desapercibido.

## Arquitectura

### Componentes Principales

1. **Tabla `audit_log`**: Almacena todos los registros de auditoría
2. **Triggers**: Se ejecutan automáticamente en cada operación de base de datos
3. **API de Auditoría**: Endpoints REST para consultar el historial de cambios
4. **Servicio de Auditoría**: Lógica de negocio para acceder a los registros

## Tabla de Auditoría

### Estructura de `audit_log`

```sql
CREATE TABLE audit_log (
    id VARCHAR2(255) PRIMARY KEY,
    tableName VARCHAR2(100) NOT NULL,
    action VARCHAR2(20) NOT NULL,
    recordId VARCHAR2(255),
    oldValues CLOB,
    newValues CLOB,
    performedBy VARCHAR2(255),
    ipAddress VARCHAR2(100),
    timestamp TIMESTAMP DEFAULT SYSTIMESTAMP
);
```

### Campos

- **id**: Identificador único del registro de auditoría (UUID)
- **tableName**: Nombre de la tabla afectada
- **action**: Tipo de operación (INSERT, UPDATE, DELETE)
- **recordId**: ID del registro modificado
- **oldValues**: JSON con los valores anteriores (UPDATE y DELETE)
- **newValues**: JSON con los valores nuevos (INSERT y UPDATE)
- **performedBy**: Usuario que realizó el cambio (si está disponible)
- **ipAddress**: Dirección IP del origen del cambio (si está disponible)
- **timestamp**: Fecha y hora del cambio

## Tablas Auditadas

El sistema audita automáticamente las siguientes tablas:

1. **users** - Usuarios del sistema
2. **parking_spaces** - Espacios de estacionamiento
3. **sensors** - Sensores IoT
4. **occupancy_events** - Eventos de ocupación
5. **reports** - Reportes generados

## Triggers Implementados

Para cada tabla auditada se crean **3 triggers**:

### 1. Trigger INSERT
Registra la creación de nuevos registros.

```sql
CREATE OR REPLACE TRIGGER trg_audit_[tabla]_insert
AFTER INSERT ON [tabla]
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (id, tableName, action, recordId, newValues, timestamp)
    VALUES (SYS_GUID_AS_CHAR(), '[tabla]', 'INSERT', :NEW.id, [json_values], SYSTIMESTAMP);
END;
```

### 2. Trigger UPDATE
Registra las modificaciones a registros existentes.

```sql
CREATE OR REPLACE TRIGGER trg_audit_[tabla]_update
AFTER UPDATE ON [tabla]
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (id, tableName, action, recordId, oldValues, newValues, timestamp)
    VALUES (SYS_GUID_AS_CHAR(), '[tabla]', 'UPDATE', :NEW.id, [old_json], [new_json], SYSTIMESTAMP);
END;
```

### 3. Trigger DELETE
Registra la eliminación de registros.

```sql
CREATE OR REPLACE TRIGGER trg_audit_[tabla]_delete
AFTER DELETE ON [tabla]
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (id, tableName, action, recordId, oldValues, timestamp)
    VALUES (SYS_GUID_AS_CHAR(), '[tabla]', 'DELETE', :OLD.id, [old_json], SYSTIMESTAMP);
END;
```

## API REST - Endpoints de Auditoría

### 🔒 Autenticación
Todos los endpoints requieren:
- Token JWT válido
- Rol de **ADMIN**

### Endpoints Disponibles

#### 1. Obtener Registros con Filtros
```http
GET /audit
```

**Query Parameters:**
- `tableName` (opcional): Filtrar por tabla específica
- `action` (opcional): Filtrar por tipo de acción (INSERT, UPDATE, DELETE)
- `recordId` (opcional): Filtrar por ID de registro
- `startDate` (opcional): Fecha inicial (ISO 8601)
- `endDate` (opcional): Fecha final (ISO 8601)
- `limit` (opcional): Número máximo de resultados

**Ejemplo:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/audit?tableName=users&action=UPDATE&limit=50"
```

#### 2. Obtener Registros por Tabla
```http
GET /audit/table/:tableName
```

**Ejemplo:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/audit/table/parking_spaces?limit=100"
```

#### 3. Obtener Historial de un Registro
```http
GET /audit/record/:tableName/:recordId
```

**Ejemplo:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/audit/record/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### 4. Obtener Registros por Acción
```http
GET /audit/action/:action
```

**Acciones válidas:** INSERT, UPDATE, DELETE

**Ejemplo:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/audit/action/DELETE?limit=50"
```

#### 5. Obtener Estadísticas
```http
GET /audit/statistics
```

**Query Parameters:**
- `startDate` (opcional): Fecha inicial
- `endDate` (opcional): Fecha final

**Respuesta:**
```json
{
  "totalRecords": 1250,
  "byTable": [
    { "tableName": "parking_spaces", "count": "450" },
    { "tableName": "occupancy_events", "count": "380" },
    { "tableName": "users", "count": "120" }
  ],
  "byAction": [
    { "action": "INSERT", "count": "550" },
    { "action": "UPDATE", "count": "620" },
    { "action": "DELETE", "count": "80" }
  ]
}
```

#### 6. Limpiar Registros Antiguos
```http
DELETE /audit/cleanup/:days
```

Elimina registros más antiguos que el número de días especificado.

**Ejemplo:**
```bash
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/audit/cleanup/90"
```

## Formato de JSON en los Registros

### INSERT
```json
{
  "newValues": "{\"id\":\"abc-123\",\"email\":\"user@example.com\",\"role\":\"admin\",\"createdAt\":\"2025-11-16 10:30:00\"}"
}
```

### UPDATE
```json
{
  "oldValues": "{\"id\":\"abc-123\",\"status\":\"free\"}",
  "newValues": "{\"id\":\"abc-123\",\"status\":\"occupied\"}"
}
```

### DELETE
```json
{
  "oldValues": "{\"id\":\"abc-123\",\"email\":\"user@example.com\",\"deletedAt\":\"2025-11-16 15:45:00\"}"
}
```

## Instalación y Configuración

### 1. Ejecutar el Script de Triggers

El script SQL se ejecuta automáticamente al inicializar el contenedor Docker. Si necesitas ejecutarlo manualmente:

```bash
# Desde el contenedor de Oracle
docker exec -it oracle-db bash
sqlplus parkingapp/password123@//localhost:1521/FREEPDB1

# Ejecutar el script
@/opt/oracle/scripts/setup/02-audit-triggers.sql
```

### 2. Verificar Triggers Creados

```sql
-- Ver todos los triggers de auditoría
SELECT trigger_name, table_name, status 
FROM user_triggers 
WHERE trigger_name LIKE 'TRG_AUDIT%'
ORDER BY table_name, trigger_name;
```

### 3. Verificar Tabla de Auditoría

```sql
-- Ver estructura de la tabla
DESC audit_log;

-- Ver registros recientes
SELECT * FROM audit_log ORDER BY timestamp DESC FETCH FIRST 10 ROWS ONLY;
```

## Casos de Uso

### 1. Auditar Cambios de Estado de Espacios
```bash
# Ver todos los cambios de estado de un espacio específico
GET /audit/record/parking_spaces/{spaceId}
```

### 2. Monitorear Cambios de Usuarios
```bash
# Ver todos los cambios en usuarios en las últimas 24 horas
GET /audit/table/users?startDate=2025-11-15T00:00:00Z&endDate=2025-11-16T00:00:00Z
```

### 3. Investigar Eliminaciones
```bash
# Ver todos los registros eliminados
GET /audit/action/DELETE
```

### 4. Análisis de Actividad
```bash
# Obtener estadísticas del último mes
GET /audit/statistics?startDate=2025-10-16T00:00:00Z&endDate=2025-11-16T23:59:59Z
```

## Mantenimiento

### Limpieza Periódica

Se recomienda limpiar registros antiguos periódicamente para mantener el rendimiento:

```bash
# Eliminar registros mayores a 90 días
DELETE /audit/cleanup/90

# Programar con cron (en el servidor)
0 2 * * 0 curl -X DELETE http://localhost:3000/audit/cleanup/90
```

### Monitoreo de Espacio

```sql
-- Ver tamaño de la tabla de auditoría
SELECT 
    segment_name,
    SUM(bytes)/1024/1024 AS size_mb
FROM user_segments
WHERE segment_name = 'AUDIT_LOG'
GROUP BY segment_name;
```

## Consideraciones de Rendimiento

1. **Impacto en Escrituras**: Los triggers añaden un pequeño overhead a las operaciones INSERT/UPDATE/DELETE
2. **Almacenamiento**: La tabla crece proporcionalmente a la actividad del sistema
3. **Índices Recomendados**:
   ```sql
   CREATE INDEX idx_audit_table ON audit_log(tableName);
   CREATE INDEX idx_audit_record ON audit_log(recordId);
   CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
   ```

## Seguridad

- ✅ Solo usuarios **ADMIN** pueden acceder a los endpoints de auditoría
- ✅ Los triggers se ejecutan en el contexto del sistema (no pueden ser deshabilitados por usuarios normales)
- ✅ Los registros de auditoría son **inmutables** (solo INSERT, no UPDATE/DELETE)
- ✅ Separación de permisos entre tabla de auditoría y tablas de negocio

## Troubleshooting

### Los triggers no se ejecutan

```sql
-- Verificar que los triggers están habilitados
SELECT trigger_name, status FROM user_triggers WHERE trigger_name LIKE 'TRG_AUDIT%';

-- Si están DISABLED, habilitarlos
ALTER TRIGGER trg_audit_users_insert ENABLE;
```

### Error al insertar en audit_log

```sql
-- Verificar que la función auxiliar existe
SELECT object_name FROM user_objects WHERE object_name = 'SYS_GUID_AS_CHAR';

-- Si no existe, recrearla
CREATE OR REPLACE FUNCTION SYS_GUID_AS_CHAR RETURN VARCHAR2 IS
BEGIN
    RETURN LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), 
           '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})', 
           '\1-\2-\3-\4-\5'));
END;
/
```

## Próximas Mejoras

- [ ] Capturar el usuario que realizó el cambio desde el contexto de la aplicación
- [ ] Capturar la dirección IP del cliente
- [ ] Implementar retención configurable de registros
- [ ] Agregar compresión de valores JSON para reducir espacio
- [ ] Dashboard visual para análisis de auditoría
- [ ] Alertas automáticas en cambios críticos

---

**Fecha de Creación**: 16 de noviembre de 2025  
**Versión**: 1.0  
**Autor**: Sistema de Auditoría Automático
