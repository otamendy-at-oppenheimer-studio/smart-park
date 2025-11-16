# ✅ Smart Park - Checklist de Instalación

## 🎯 Objetivo
Integrar el sistema de IA con el backend NestJS y frontend Vue para detección en tiempo real.

---

## 📝 Checklist Pre-instalación

### Backend (NestJS)
- [ ] PostgreSQL corriendo en puerto `5433`
- [ ] Backend iniciado: `npm run start:dev`
- [ ] Espacios de parking creados (mínimo 4)
  - [ ] Códigos: A-01, A-02, A-03, A-04 (o los que uses)
  - [ ] Comando: `POST /parking/spaces/multiple` con `count: 4`

### Frontend (Vue)
- [ ] Frontend iniciado: `npm run dev`
- [ ] Puede conectarse al backend
- [ ] Espacios visibles en la interfaz

### Sistema de IA (Python)
- [ ] Python 3.8+ instalado
- [ ] Cámara web conectada (o video de prueba)
- [ ] Modelo YOLO disponible en `runs/train/toycar_detector_finalsafe4/weights/best.pt`

---

## 🔧 Checklist Instalación IA

### 1. Dependencias
```bash
cd parking-monitor-ai
pip install -r requirements.txt
```
- [ ] `psycopg2-binary` instalado correctamente
- [ ] `ultralytics` (YOLO) instalado
- [ ] `opencv-python` instalado

### 2. Configuración
```bash
cp .env.example .env
nano .env  # o tu editor preferido
```
- [ ] `DB_HOST=localhost` (o IP del servidor PostgreSQL)
- [ ] `DB_PORT=5433` (mismo que docker-compose.yml)
- [ ] `DB_USER=admin`
- [ ] `DB_PASSWORD=admin123`
- [ ] `DB_NAME=parkingdb`

### 3. Mapeo de Plazas
```bash
nano config/spot_mapping.json
```
- [ ] IDs mapeados a spaceCodes correctos
- [ ] Ejemplo:
  ```json
  {
      "1": "A-01",
      "2": "A-02",
      "3": "A-03",
      "4": "A-04"
  }
  ```

### 4. Verificación
```bash
cd src
python verify_setup.py
```
- [ ] ✅ Conexión a PostgreSQL exitosa
- [ ] ✅ Espacios listados correctamente
- [ ] ✅ Todos los spaceCodes del mapeo existen en BD

---

## 🚀 Checklist Ejecución

### Orden de inicio recomendado:

1. **Backend**
```bash
cd parking-iot-system-main
docker-compose up -d postgres  # Si usas Docker
npm run start:dev
```
- [ ] PostgreSQL corriendo
- [ ] Backend en http://localhost:3000
- [ ] Puede hacer GET /parking/spaces exitosamente

2. **Frontend**
```bash
cd SmartParking-master
npm run dev
```
- [ ] Frontend en http://localhost:5173 (o el puerto configurado)
- [ ] Login funciona
- [ ] Espacios se visualizan

3. **IA Monitor**
```bash
cd parking-monitor-ai/src
python parking_monitor.py
```
- [ ] Cámara se abre correctamente
- [ ] Detecciones YOLO funcionan
- [ ] Mensajes de actualización en consola:
  ```
  [INFO] ✅ Actualizado A-02: free → occupied
  [INFO] Estado sincronizado con PostgreSQL correctamente.
  ```

---

## 🧪 Checklist Pruebas

### Prueba 1: Detección de Cambio
1. [ ] Monitor de IA corriendo
2. [ ] Coloca un objeto/vehículo en una plaza
3. [ ] Verifica consola IA: `[INFO] Plaza X: ✅ OCUPADA`
4. [ ] Espera 5-10 segundos
5. [ ] Verifica frontend: La plaza debe mostrar "OCUPADA"

### Prueba 2: Liberación de Plaza
1. [ ] Retira el objeto/vehículo
2. [ ] Verifica consola IA: `[INFO] Plaza X: 🟩 LIBRE`
3. [ ] Verifica frontend: La plaza debe mostrar "LIBRE"

### Prueba 3: Múltiples Cambios
1. [ ] Ocupa/libera varias plazas simultáneamente
2. [ ] Verifica que todos los cambios se reflejen
3. [ ] Revisa en frontend el historial de eventos

### Prueba 4: Historial
1. [ ] Frontend → Sección de Eventos/Historial
2. [ ] Verifica que cada cambio creó un evento con timestamp
3. [ ] Los eventos deben corresponder a los cambios detectados

---

## ❌ Checklist Troubleshooting

### Si la IA no conecta a PostgreSQL:
- [ ] Verifica que PostgreSQL esté corriendo: `docker ps` o `pg_isready`
- [ ] Confirma puerto correcto (5433 vs 5432)
- [ ] Prueba credenciales con: `psql -h localhost -p 5433 -U admin -d parkingdb`

### Si no se actualizan los espacios:
- [ ] Verifica consola IA: ¿hay errores?
- [ ] Confirma que `spot_mapping.json` es correcto
- [ ] Ejecuta: `python verify_setup.py`
- [ ] Revisa logs del backend

### Si frontend no muestra cambios:
- [ ] Espera 5-10 segundos (polling interval)
- [ ] Fuerza refresh (F5)
- [ ] Verifica consola del navegador (errores de red)
- [ ] Confirma que backend responde: `curl http://localhost:3000/parking/spaces`

### Si YOLO no detecta vehículos:
- [ ] Verifica iluminación de la cámara
- [ ] Ajusta `conf` threshold en `parking_monitor.py` (línea ~51)
- [ ] Prueba con objetos más grandes primero
- [ ] Revisa que el modelo YOLO esté entrenado para tus objetos

---

## 📊 Checklist Monitoreo

### Métricas a revisar:

**Consola IA:**
- [ ] FPS estable (depende de tu hardware)
- [ ] Detecciones consistentes
- [ ] Sin errores de PostgreSQL

**Backend:**
- [ ] Sin errores 500
- [ ] Respuestas rápidas (<100ms típicamente)

**Frontend:**
- [ ] Actualizaciones fluidas
- [ ] Sin errores en consola del navegador

**PostgreSQL:**
- [ ] Conexiones estables
- [ ] Sin locks de tabla
- [ ] Espacio en disco suficiente

---

## 🎉 Checklist Éxito

Si todos estos puntos están verificados, ¡el sistema está funcionando correctamente!

- [ ] ✅ IA detecta ocupación en tiempo real
- [ ] ✅ PostgreSQL se actualiza correctamente
- [ ] ✅ Backend sirve datos actualizados
- [ ] ✅ Frontend muestra cambios en ~5 segundos
- [ ] ✅ Historial de eventos se registra
- [ ] ✅ Sin errores en ningún componente

---

## 📚 Documentación Adicional

- **Integración completa**: `README_INTEGRATION.md`
- **Cambios técnicos**: `MIGRATION_GUIDE.md`
- **API del backend**: `../parking-iot-system-main/API_FRONTEND_DOCS.md`

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 2.0.0
