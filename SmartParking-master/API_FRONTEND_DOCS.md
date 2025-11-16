# 🚗 Parking IoT System - API Documentation for Frontend

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Get the token from the `/auth/login` endpoint.

---

## 🔐 Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "message": "Login exitoso",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "7cc5a4d4-b18d-4b30-9b28-a9160f48ee26",
    "email": "otamendy@oppenheimer.studio",
    "role": "admin"
  }
}
```

**Response 401:**
```json
{
  "message": "Error de autenticación",
  "error": "Invalid credentials"
}
```

---

## 👥 Users Management

### Get All Users
```http
GET /users
```
**Auth Required:** Yes (Admin only)

**Response 200:**
```json
[
  {
    "id": "7cc5a4d4-b18d-4b30-9b28-a9160f48ee26",
    "email": "otamendy@oppenheimer.studio",
    "role": "admin",
    "createdAt": "2025-10-08T20:56:05.049Z",
    "updatedAt": "2025-10-08T20:56:05.049Z",
    "deleted": null
  }
]
```

### Get User by ID
```http
GET /users/{id}
```
**Auth Required:** Yes (Admin only)

**Response 200:**
```json
{
  "id": "7cc5a4d4-b18d-4b30-9b28-a9160f48ee26",
  "email": "otamendy@oppenheimer.studio",
  "role": "admin",
  "createdAt": "2025-10-08T20:56:05.049Z",
  "updatedAt": "2025-10-08T20:56:05.049Z",
  "deleted": null
}
```

**Response 404:**
```json
{
  "message": "Usuario no encontrado"
}
```

### Create User
```http
POST /users
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "123456",
  "role": "user"  // optional, defaults to "user". Options: "admin" | "user"
}
```

**Response 201:**
```json
{
  "message": "Usuario creado con éxito",
  "user": {
    "id": "new-uuid",
    "email": "nuevo@ejemplo.com",
    "role": "user",
    "createdAt": "2025-10-08T21:00:00.000Z",
    "updatedAt": "2025-10-08T21:00:00.000Z",
    "deleted": null
  }
}
```

**Response 400:**
```json
{
  "message": "Error al crear usuario",
  "error": "Email already exists"
}
```

### Update User
```http
PATCH /users/{id}
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "email": "nuevo@ejemplo.com",     // optional
  "password": "newpassword",        // optional
  "role": "admin"                   // optional
}
```

**Response 200:**
```json
{
  "message": "Usuario actualizado con éxito",
  "user": {
    "id": "uuid",
    "email": "nuevo@ejemplo.com",
    "role": "admin",
    "createdAt": "2025-10-08T20:56:05.049Z",
    "updatedAt": "2025-10-08T21:05:00.000Z",
    "deleted": null
  }
}
```

### Delete User (Soft Delete)
```http
DELETE /users/{id}
```
**Auth Required:** Yes (Admin only)

**Response 200:**
```json
{
  "message": "Usuario eliminado (soft delete) con éxito"
}
```

---

## 🅿️ Parking Spaces

### Get All Parking Spaces
```http
GET /parking/spaces
```
**Auth Required:** No

**Response 200:**
```json
[
  {
    "id": "space-uuid-1",
    "spaceCode": "A-01",
    "status": "free",
    "floor": "1",
    "sensors": [
      {
        "id": "sensor-uuid",
        "hwId": "ESP32_001",
        "type": "ultrasonic",
        "locationDescription": "Piso 1, Zona A",
        "active": true
      }
    ],
    "createdAt": "2025-10-08T20:00:00.000Z",
    "updatedAt": "2025-10-08T20:30:00.000Z"
  }
]
```

### Get Parking Space by ID
```http
GET /parking/spaces/{id}
```
**Auth Required:** No

**Response 200:**
```json
{
  "id": "space-uuid-1",
  "spaceCode": "A-01",
  "status": "free",
  "floor": "1",
  "sensors": [...],
  "createdAt": "2025-10-08T20:00:00.000Z",
  "updatedAt": "2025-10-08T20:30:00.000Z"
}
```

### Create Parking Space
```http
POST /parking/spaces
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "status": "free",    // optional, defaults to "unknown". Options: "free" | "occupied" | "unknown"
  "floor": "1"         // optional
}
```

**Response 201:**
```json
{
  "message": "Espacio creado con éxito",
  "space": {
    "id": "new-space-uuid",
    "spaceCode": "A-02",  // auto-generated
    "status": "free",
    "floor": "1",
    "sensors": [],
    "createdAt": "2025-10-08T21:00:00.000Z",
    "updatedAt": "2025-10-08T21:00:00.000Z"
  }
}
```

### Create Multiple Parking Spaces
```http
POST /parking/spaces/multiple
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "count": 10
}
```

**Response 201:**
```json
{
  "message": "Espacios creados con éxito",
  "spaces": [
    {
      "id": "uuid-1",
      "spaceCode": "A-01",
      "status": "unknown",
      "floor": null,
      "sensors": [],
      "createdAt": "2025-10-08T21:00:00.000Z",
      "updatedAt": "2025-10-08T21:00:00.000Z"
    }
    // ... 9 more spaces
  ]
}
```

### Update Parking Space
```http
PUT /parking/spaces/{id}
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "status": "occupied",  // optional
  "floor": "2"           // optional
}
```

**Response 200:**
```json
{
  "message": "Espacio actualizado con éxito",
  "space": {
    "id": "space-uuid",
    "spaceCode": "A-01",
    "status": "occupied",
    "floor": "2",
    "sensors": [...],
    "createdAt": "2025-10-08T20:00:00.000Z",
    "updatedAt": "2025-10-08T21:10:00.000Z"
  }
}
```

### Update Parking Space Status (Manual Override)
```http
PATCH /parking/spaces/{id}/status
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "status": "free"  // required. Options: "free" | "occupied" | "unknown"
}
```

**Response 200:**
```json
{
  "message": "Estado actualizado con éxito",
  "space": {
    "id": "space-uuid",
    "spaceCode": "A-01",
    "status": "free",
    "floor": "1",
    "sensors": [...],
    "createdAt": "2025-10-08T20:00:00.000Z",
    "updatedAt": "2025-10-08T21:15:00.000Z"
  }
}
```

### Delete Parking Space (Soft Delete)
```http
DELETE /parking/spaces/{id}
```
**Auth Required:** Yes (Admin only)

**Response 200:**
```json
{
  "message": "Espacio eliminado con éxito"
}
```

---

## 📡 Sensors

### Get All Sensors
```http
GET /sensors
```
**Auth Required:** No

**Response 200:**
```json
[
  {
    "id": "sensor-uuid",
    "hwId": "ESP32_001",
    "type": "ultrasonic",
    "locationDescription": "Piso 1, Zona A",
    "active": true,
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "A-01",
      "status": "free"
    },
    "createdAt": "2025-10-08T20:00:00.000Z",
    "updatedAt": "2025-10-08T20:00:00.000Z"
  }
]
```

### Get Sensor by ID
```http
GET /sensors/{id}
```
**Auth Required:** No

**Response 200:**
```json
{
  "id": "sensor-uuid",
  "hwId": "ESP32_001",
  "type": "ultrasonic",
  "locationDescription": "Piso 1, Zona A",
  "active": true,
  "parkingSpace": {
    "id": "space-uuid",
    "spaceCode": "A-01",
    "status": "free"
  },
  "createdAt": "2025-10-08T20:00:00.000Z",
  "updatedAt": "2025-10-08T20:00:00.000Z"
}
```

**Response 404:**
```json
{
  "message": "Sensor no encontrado"
}
```

### Create Sensor
```http
POST /sensors
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "hwId": "ESP32_002",                          // required, unique hardware ID
  "type": "ultrasonic",                         // optional, defaults to "ultrasonic". Options: "ultrasonic" | "magnetic" | "radar"
  "locationDescription": "Piso 2, Zona B",     // optional
  "parkingSpaceId": "space-uuid"                // optional, associate with parking space
}
```

**Response 201:**
```json
{
  "message": "Sensor creado con éxito",
  "sensor": {
    "id": "new-sensor-uuid",
    "hwId": "ESP32_002",
    "type": "ultrasonic",
    "locationDescription": "Piso 2, Zona B",
    "active": true,
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "B-01"
    },
    "createdAt": "2025-10-08T21:00:00.000Z",
    "updatedAt": "2025-10-08T21:00:00.000Z"
  }
}
```

**Response 400:**
```json
{
  "message": "Error al crear el sensor",
  "error": "Hardware ID already exists"
}
```

### Update Sensor
```http
PATCH /sensors/{id}
```
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "type": "magnetic",                           // optional
  "locationDescription": "New location",        // optional
  "parkingSpaceId": "new-space-uuid",          // optional
  "active": false                               // optional
}
```

**Response 200:**
```json
{
  "message": "Sensor actualizado con éxito",
  "sensor": {
    "id": "sensor-uuid",
    "hwId": "ESP32_002",
    "type": "magnetic",
    "locationDescription": "New location",
    "active": false,
    "parkingSpace": {
      "id": "new-space-uuid",
      "spaceCode": "C-01"
    },
    "createdAt": "2025-10-08T20:00:00.000Z",
    "updatedAt": "2025-10-08T21:15:00.000Z"
  }
}
```

### Delete Sensor (Soft Delete)
```http
DELETE /sensors/{id}
```
**Auth Required:** Yes (Admin only)

**Response 200:**
```json
{
  "message": "Sensor eliminado (soft delete) con éxito"
}
```

### Process Sensor Event (IoT Endpoint)
```http
POST /sensors/event
```
**Auth Required:** No (Used by IoT devices)

**Request Body:**
```json
{
  "hwId": "ESP32_001",              // required, hardware ID of the sensor
  "status": "occupied"              // required. Options: "free" | "occupied" | "unknown"
}
```

**Response 200:**
```json
{
  "message": "Evento procesado y estado actualizado con éxito",
  "event": {
    "id": "event-uuid",
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "A-01",
      "status": "occupied"
    },
    "status": "occupied",
    "timestamp": "2025-10-08T21:20:00.000Z"
  }
}
```

**Response 400:**
```json
{
  "message": "Error al procesar el evento",
  "error": "Sensor not found or inactive"
}
```

---

## 📊 Occupancy Events

### Get All Occupancy Events
```http
GET /occupancy
```
**Auth Required:** No

**Response 200:**
```json
[
  {
    "id": "event-uuid",
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "A-01",
      "status": "occupied",
      "floor": "1"
    },
    "status": "occupied",
    "timestamp": "2025-10-08T21:20:00.000Z"
  }
]
```

### Get Occupancy Event by ID
```http
GET /occupancy/event/{id}
```
**Auth Required:** No

**Response 200:**
```json
{
  "id": "event-uuid",
  "parkingSpace": {
    "id": "space-uuid",
    "spaceCode": "A-01",
    "status": "occupied",
    "floor": "1"
  },
  "status": "occupied",
  "timestamp": "2025-10-08T21:20:00.000Z"
}
```

**Response 404:**
```json
{
  "message": "Evento no encontrado"
}
```

### Create Occupancy Event (Manual)
```http
POST /occupancy
```
**Auth Required:** No

**Request Body:**
```json
{
  "parkingSpaceId": "space-uuid",    // required
  "status": "occupied"               // required. Options: "free" | "occupied" | "unknown"
}
```

**Response 201:**
```json
{
  "message": "Evento de ocupación creado con éxito",
  "event": {
    "id": "new-event-uuid",
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "A-01"
    },
    "status": "occupied",
    "timestamp": "2025-10-08T21:25:00.000Z"
  }
}
```

### Update Occupancy Event
```http
PATCH /occupancy/event/{id}
```
**Auth Required:** No

**Request Body:**
```json
{
  "status": "free"    // required. Options: "free" | "occupied" | "unknown"
}
```

**Response 200:**
```json
{
  "message": "Evento actualizado con éxito",
  "event": {
    "id": "event-uuid",
    "parkingSpace": {
      "id": "space-uuid",
      "spaceCode": "A-01"
    },
    "status": "free",
    "timestamp": "2025-10-08T21:20:00.000Z"
  }
}
```

### Delete Occupancy Event (Soft Delete)
```http
DELETE /occupancy/event/{id}
```
**Auth Required:** No

**Response 200:**
```json
{
  "message": "Evento eliminado con éxito"
}
```

### Get Parking Space History
```http
GET /occupancy/history/{parkingSpaceId}
```
**Auth Required:** No

**Response 200:**
```json
[
  {
    "id": "event-uuid-1",
    "status": "occupied",
    "timestamp": "2025-10-08T21:20:00.000Z"
  },
  {
    "id": "event-uuid-2",
    "status": "free",
    "timestamp": "2025-10-08T22:15:00.000Z"
  }
]
```

---

## 📈 Reports

### Get All Reports
```http
GET /reports
```
**Auth Required:** Yes (Admin or User)

**Response 200:**
```json
[
  {
    "id": "report-uuid",
    "parkingSpaceId": "space-uuid",
    "startDate": "2025-10-07T00:00:00.000Z",
    "endDate": "2025-10-07T23:59:59.000Z",
    "data": {
      "totalEvents": 15,
      "occupiedTime": "08:30:00",
      "freeTime": "15:30:00",
      "occupancyRate": 0.35
    },
    "createdAt": "2025-10-08T21:00:00.000Z"
  }
]
```

### Create Report
```http
POST /reports
```
**Auth Required:** Yes (Admin or User)

**Request Body:**
```json
{
  "parkingSpaceId": "space-uuid",         // required
  "startDate": "2025-10-07T00:00:00Z",    // required, ISO 8601 format
  "endDate": "2025-10-07T23:59:59Z"       // required, ISO 8601 format
}
```

**Response 201:**
```json
{
  "message": "Reporte creado con éxito",
  "report": {
    "id": "new-report-uuid",
    "parkingSpaceId": "space-uuid",
    "startDate": "2025-10-07T00:00:00.000Z",
    "endDate": "2025-10-07T23:59:59.000Z",
    "data": {
      "totalEvents": 15,
      "occupiedTime": "08:30:00",
      "freeTime": "15:30:00",
      "occupancyRate": 0.35
    },
    "createdAt": "2025-10-08T21:30:00.000Z"
  }
}
```

### Update Report
```http
PUT /reports/{id}
```
**Auth Required:** Yes (Admin or User)

**Request Body:**
```json
{
  "startDate": "2025-10-07T06:00:00Z",    // optional
  "endDate": "2025-10-07T18:00:00Z"       // optional
}
```

**Response 200:**
```json
{
  "message": "Reporte actualizado con éxito",
  "report": {
    "id": "report-uuid",
    "parkingSpaceId": "space-uuid",
    "startDate": "2025-10-07T06:00:00.000Z",
    "endDate": "2025-10-07T18:00:00.000Z",
    "data": {
      "totalEvents": 8,
      "occupiedTime": "06:15:00",
      "freeTime": "05:45:00",
      "occupancyRate": 0.52
    },
    "createdAt": "2025-10-08T21:00:00.000Z",
    "updatedAt": "2025-10-08T21:35:00.000Z"
  }
}
```

### Delete Report (Soft Delete)
```http
DELETE /reports/{id}
```
**Auth Required:** Yes (Admin or User)

**Response 200:**
```json
{
  "message": "Reporte eliminado con éxito"
}
```

---

## 📋 Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  deleted: string | null;
}
```

### Parking Space
```typescript
interface ParkingSpace {
  id: string;
  spaceCode: string;              // e.g., "A-01", "B-03"
  status: "free" | "occupied" | "unknown";
  floor: string | null;
  sensors: Sensor[];
  createdAt: string;
  updatedAt: string;
}
```

### Sensor
```typescript
interface Sensor {
  id: string;
  hwId: string;                   // Unique hardware identifier
  type: "ultrasonic" | "magnetic" | "radar";
  locationDescription: string | null;
  active: boolean;
  parkingSpace: ParkingSpace | null;
  createdAt: string;
  updatedAt: string;
}
```

### Occupancy Event
```typescript
interface OccupancyEvent {
  id: string;
  parkingSpace: ParkingSpace;
  status: "free" | "occupied" | "unknown";
  timestamp: string;
}
```

### Report
```typescript
interface Report {
  id: string;
  parkingSpaceId: string;
  startDate: string;
  endDate: string;
  data: {
    totalEvents: number;
    occupiedTime: string;         // HH:MM:SS format
    freeTime: string;             // HH:MM:SS format
    occupancyRate: number;        // 0.0 to 1.0
  };
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🔧 Error Responses

### Common Error Format
All error responses follow this structure:
```json
{
  "message": "Error description",
  "error": "Detailed error information"  // optional
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Frontend Integration Examples

### Authentication Flow
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.access_token);
    return data.user;
  }
  throw new Error(data.message);
};

// Authenticated request
const getSpaces = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/parking/spaces', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Real-time Dashboard
```javascript
// Get current parking status
const getDashboardData = async () => {
  const spaces = await fetch('/parking/spaces').then(r => r.json());
  const recentEvents = await fetch('/occupancy').then(r => r.json());
  
  const stats = {
    total: spaces.length,
    occupied: spaces.filter(s => s.status === 'occupied').length,
    free: spaces.filter(s => s.status === 'free').length,
    unknown: spaces.filter(s => s.status === 'unknown').length
  };
  
  return { spaces, recentEvents, stats };
};

// Poll for updates every 5 seconds
setInterval(getDashboardData, 5000);
```

### Create Report
```javascript
const createReport = async (spaceId, startDate, endDate) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      parkingSpaceId: spaceId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
  });
  return response.json();
};
```

---

## 📱 Recommended Frontend Features

### 🎯 Essential Views
1. **Real-time Dashboard** - Current parking status
2. **Space Management** - CRUD operations for parking spaces
3. **Sensor Management** - Monitor and configure IoT sensors
4. **Analytics & Reports** - Historical data and insights
5. **User Management** - Admin panel for user operations

### 🔄 Real-time Updates
Consider implementing:
- **Periodic polling** (every 5-10 seconds)
- **WebSocket connection** (requires backend extension)
- **Server-Sent Events** for live updates

### 📊 Data Visualization
Recommended charts:
- **Occupancy rate over time** (line chart)
- **Space utilization heatmap** (calendar view)
- **Current status overview** (pie/donut chart)
- **Sensor health status** (status indicators)

---

*This API documentation is specifically designed for frontend developers. For backend development details, refer to the main README.md file.*