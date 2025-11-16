# 🚀 GUÍA DE INICIO RÁPIDO - Smart Park

## Para el Usuario Final

Esta guía te llevará paso a paso desde cero hasta tener el sistema completo funcionando.

---

## 📦 Lo Que Necesitas

- ✅ Computadora con Windows, Linux o Mac
- ✅ Python 3.8 o superior instalado
- ✅ Node.js instalado (para backend/frontend)
- ✅ Docker instalado (recomendado para PostgreSQL)
- ✅ Cámara web conectada

---

## 🎬 Paso a Paso

### PASO 1️⃣: Iniciar Backend y Base de Datos

**📂 Ubicación:** `parking-iot-system-main/`

```bash
# Navega a la carpeta del backend
cd parking-iot-system-main

# Inicia PostgreSQL con Docker
docker-compose up -d postgres

# Espera unos segundos, luego inicia el backend
npm install  # Solo la primera vez
npm run start:dev
```

**✅ Verificación:**
- La consola debe mostrar: `Nest application successfully started`
- Visita: http://localhost:3000/parking/spaces (debe mostrar `[]` o espacios)

---

### PASO 2️⃣: Crear Espacios de Estacionamiento

Tienes dos opciones:

**Opción A: Desde el frontend (recomendado)**
1. Inicia el frontend (ver PASO 3)
2. Haz login
3. Ve a **Configuración → Espacios**
4. Crea 4 espacios (o los que necesites)

**Opción B: Con curl**
```bash
# Primero haz login para obtener el token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Copia el access_token de la respuesta, luego:
curl -X POST http://localhost:3000/parking/spaces/multiple \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"count": 4}'
```

**✅ Verificación:**
- GET http://localhost:3000/parking/spaces debe mostrar 4 espacios
- Deben tener códigos: A-01, A-02, A-03, A-04

---

### PASO 3️⃣: Iniciar Frontend

**📂 Ubicación:** `SmartParking-master/`

```bash
# Navega a la carpeta del frontend
cd SmartParking-master

# Instala dependencias (solo la primera vez)
npm install

# Inicia el servidor de desarrollo
npm run dev
```

**✅ Verificación:**
- La consola debe mostrar: `Local: http://localhost:5173/` (o similar)
- Abre el navegador en esa URL
- Debe aparecer la página de login

**📝 Credenciales por defecto:**
- Email: `admin@example.com`
- Password: `admin123`

---

### PASO 4️⃣: Configurar Sistema de IA

**📂 Ubicación:** `parking-monitor-ai/`

#### A. Instalar Dependencias

```bash
# Navega a la carpeta de IA
cd parking-monitor-ai

# Instala las dependencias de Python
pip install -r requirements.txt
```

#### B. Configurar Conexión a Base de Datos

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env
# En Windows: notepad .env
# En Linux/Mac: nano .env
```

**Contenido del .env:**
```bash
DB_HOST=localhost
DB_PORT=5433
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=parkingdb
```

**⚠️ IMPORTANTE:** Estos valores deben coincidir con los del backend (ver `parking-iot-system-main/docker-compose.yml`)

#### C. Configurar Mapeo de Plazas

```bash
# Edita el archivo de mapeo
# En Windows: notepad config\spot_mapping.json
# En Linux/Mac: nano config/spot_mapping.json
```

**Ejemplo de `spot_mapping.json`:**
```json
{
    "1": "A-01",
    "2": "A-02",
    "3": "A-03",
    "4": "A-04"
}
```

**Explicación:**
- El **"1"** es el ID de la plaza en tu video/cámara (definido en `config/parking_spots.json`)
- El **"A-01"** es el código del espacio en el backend (debe existir en la BD)

---

### PASO 5️⃣: Verificar Configuración

```bash
# Desde parking-monitor-ai/
cd src
python verify_setup.py
```

**✅ Deberías ver:**
```
🔍 Probando conexión a PostgreSQL...
✅ Conexión exitosa!

📋 Espacios de estacionamiento en la base de datos:
ID                                   Código     Estado          Piso
---------------------------------------------------------------------------
a1b2c3d4-...                        A-01       🟩 free         N/A
e5f6g7h8-...                        A-02       🟩 free         N/A
...

🗺️  Verificando mapeo de plazas...
   ✅ 1 → A-01 (UUID: a1b2c3d4...)
   ✅ 2 → A-02 (UUID: e5f6g7h8...)
   ...
✅ Todos los códigos del mapeo existen en la BD
```

**❌ Si ves errores:**
- "Connection refused" → PostgreSQL no está corriendo (vuelve a PASO 1)
- "No se encontró el UUID" → El spaceCode no existe (vuelve a PASO 2)
- "No se pudo leer spot_mapping.json" → Crea/edita el archivo (vuelve a PASO 4C)

---

### PASO 6️⃣: Iniciar Monitor de IA

#### Opción A: Script Automático (Recomendado)

**Linux/Mac:**
```bash
bash start.sh
```

**Windows:**
```bash
start.bat
```

#### Opción B: Manual

```bash
cd src
python parking_monitor.py
```

**✅ Deberías ver:**
1. Una ventana de OpenCV con la vista de la cámara
2. Cuadros verdes/rojos marcando las plazas
3. Cuadros azules cuando detecta vehículos
4. En la consola:
   ```
   [INFO] Cámara iniciada (640x480). Presiona 'q' para salir.
   [INFO] Plaza 1: 🟩 LIBRE
   [INFO] Plaza 2: ✅ OCUPADA
   ...
   [INFO] ✅ Actualizado A-02: free → occupied
   [INFO] Estado sincronizado con PostgreSQL correctamente.
   ```

---

### PASO 7️⃣: Ver Resultados en Frontend

1. **Ve al navegador** (http://localhost:5173)
2. **Haz login** si aún no lo has hecho
3. **Ve al Dashboard/Inicio**
4. **Observa las plazas de estacionamiento**

**🎉 ÉXITO si:**
- Las plazas cambian de estado cuando pones/quitas objetos frente a la cámara
- Los cambios aparecen en el frontend en ~5-10 segundos
- Puedes ver el historial de eventos

---

## 🎬 Resumen Visual del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: Backend + PostgreSQL                              │
│  cd parking-iot-system-main                                │
│  docker-compose up -d postgres                             │
│  npm run start:dev                                         │
│  ✅ http://localhost:3000                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: Crear Espacios                                    │
│  POST /parking/spaces/multiple                             │
│  ✅ 4 espacios: A-01, A-02, A-03, A-04                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: Frontend                                          │
│  cd SmartParking-master                                    │
│  npm run dev                                               │
│  ✅ http://localhost:5173                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 4-5: Configurar y Verificar IA                       │
│  cd parking-monitor-ai                                     │
│  pip install -r requirements.txt                           │
│  cp .env.example .env (editar)                             │
│  editar config/spot_mapping.json                           │
│  python src/verify_setup.py                                │
│  ✅ Todo configurado correctamente                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 6: Iniciar Monitor IA                                │
│  bash start.sh (o start.bat)                               │
│  ✅ Ventana OpenCV abierta + Detecciones funcionando       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 7: Ver en Frontend                                   │
│  http://localhost:5173                                     │
│  🎉 PLAZAS ACTUALIZÁNDOSE EN TIEMPO REAL                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Prueba Rápida

1. **Asegúrate de que todo esté corriendo:**
   - Backend: http://localhost:3000/parking/spaces
   - Frontend: http://localhost:5173
   - IA: Ventana OpenCV abierta

2. **Coloca un objeto frente a la cámara** en una de las zonas de plaza

3. **Observa la consola de IA:**
   ```
   [INFO] Plaza 2: ✅ OCUPADA
   [INFO] ✅ Actualizado A-02: free → occupied
   ```

4. **Espera 5-10 segundos**

5. **Mira el frontend:**
   - La plaza A-02 debe mostrar "OCUPADA" 🚗

6. **Retira el objeto**

7. **Observa:**
   ```
   [INFO] Plaza 2: 🟩 LIBRE
   [INFO] ✅ Actualizado A-02: occupied → free
   ```

8. **El frontend debe actualizar a "LIBRE" 🟩**

---

## 🆘 Problemas Comunes

### "No puedo conectarme a PostgreSQL"
```bash
# Verifica que esté corriendo
docker ps | grep postgres

# Si no aparece, inícialo
cd parking-iot-system-main
docker-compose up -d postgres
```

### "El frontend no se conecta al backend"
```bash
# Verifica el backend
curl http://localhost:3000/parking/spaces

# Si no responde, reinicia el backend
cd parking-iot-system-main
npm run start:dev
```

### "La IA no detecta vehículos"
1. Verifica que la cámara funcione (deberías ver imagen)
2. Prueba con objetos más grandes
3. Revisa la iluminación
4. Ajusta el umbral en `parking_monitor.py` línea ~78: `if overlap > 0.05`

### "No se actualizan los datos en frontend"
1. Espera al menos 10 segundos
2. Presiona F5 en el navegador
3. Verifica que la consola de IA muestre "✅ Actualizado..."
4. Confirma que el backend responda: `curl http://localhost:3000/parking/spaces`

---

## 📱 Contacto y Soporte

Si sigues teniendo problemas:

1. ✅ Revisa `INSTALLATION_CHECKLIST.md`
2. ✅ Ejecuta `python src/verify_setup.py`
3. ✅ Revisa `MIGRATION_GUIDE.md` para detalles técnicos

---

## 🎉 ¡Listo!

Si llegaste aquí y todo funciona:

**¡FELICITACIONES! 🎊**

Tienes un sistema completo de monitoreo de estacionamiento con:
- ✅ Detección automática por IA
- ✅ Base de datos centralizada
- ✅ API REST funcional
- ✅ Interfaz web en tiempo real
- ✅ Historial de eventos

**¡Disfruta tu Smart Park! 🚗🎉**

---

**Última actualización:** Noviembre 2025
