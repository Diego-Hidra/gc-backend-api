# Entry Logs - Documentación de Endpoints

## Descripción General

Los endpoints de Entry Logs permiten consultar los registros de acceso al condominio, separados por método de acceso:
- **QR**: Código QR escaneado
- **Facial**: Reconocimiento facial
- **Vehicle**: Reconocimiento de patente

Todos los endpoints requieren autenticación JWT.

---

## 1. Últimos Registros de Acceso Personal

### `GET /api/entry-logs/latest/personal`

Obtiene los últimos registros de acceso por QR y reconocimiento facial, separados.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `limit` | number | 5 | 20 | Cantidad de registros por categoría |

**Ejemplo 1:** Obtener últimos 5 (default)
```http
GET /api/entry-logs/latest/personal
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "qr": [
      {
        "id": "a1b2c3d4-...",
        "type": "access",
        "action": "check_in",
        "description": "Check-in de visitante: Juan Pérez (12345678-9)",
        "timestamp": "2025-12-10T15:30:00.000Z",
        "details": { "method": "qr", "visitorName": "Juan Pérez" }
      }
    ],
    "facial": [
      {
        "id": "e5f6g7h8-...",
        "type": "access",
        "action": "check_in",
        "description": "Check-in por reconocimiento facial: María López",
        "timestamp": "2025-12-10T15:25:00.000Z",
        "details": { "method": "facial", "confidence": 0.98 }
      }
    ]
  },
  "total": { "qr": 5, "facial": 3 }
}
```

**Ejemplo 2:** Obtener últimos 10
```http
GET /api/entry-logs/latest/personal?limit=10
Authorization: Bearer <token>
```

---

## 2. Últimos Registros de Vehículos

### `GET /api/entry-logs/latest/vehicle`

Obtiene los últimos registros de acceso por reconocimiento de patente.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `limit` | number | 5 | 20 | Cantidad de registros |

**Ejemplo 1:** Obtener últimos 5
```http
GET /api/entry-logs/latest/vehicle
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "v1v2v3v4-...",
      "type": "access",
      "action": "check_in",
      "description": "Entrada de vehículo: ABCD12",
      "timestamp": "2025-12-10T14:00:00.000Z",
      "details": { 
        "method": "vehicle_plate", 
        "licensePlate": "ABCD12",
        "vehicleType": "SEDAN"
      }
    }
  ],
  "total": 5
}
```

**Ejemplo 2:** Obtener últimos 3
```http
GET /api/entry-logs/latest/vehicle?limit=3
Authorization: Bearer <token>
```

---

## 3. Registros del Día - Personal

### `GET /api/entry-logs/today/personal`

Obtiene todos los registros de QR y facial del día actual con paginación.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | - | Número de página |
| `limit` | number | 20 | 100 | Registros por página |

**Ejemplo 1:** Primera página
```http
GET /api/entry-logs/today/personal
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "qr": [...],
    "facial": [...]
  },
  "meta": {
    "qr": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 },
    "facial": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
  },
  "date": "2025-12-10"
}
```

**Ejemplo 2:** Página 2 con 50 registros
```http
GET /api/entry-logs/today/personal?page=2&limit=50
Authorization: Bearer <token>
```

---

## 4. Registros del Día - Vehículos

### `GET /api/entry-logs/today/vehicle`

Obtiene todos los registros de vehículos del día actual con paginación.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | - | Número de página |
| `limit` | number | 20 | 100 | Registros por página |

**Ejemplo 1:** Obtener registros del día
```http
GET /api/entry-logs/today/vehicle
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "action": "check_in",
      "description": "Entrada de vehículo: WXYZ99",
      "timestamp": "2025-12-10T08:30:00.000Z",
      "details": { "method": "vehicle_plate", "licensePlate": "WXYZ99" }
    }
  ],
  "meta": { "total": 28, "page": 1, "limit": 20, "totalPages": 2 },
  "date": "2025-12-10"
}
```

**Ejemplo 2:** Segunda página
```http
GET /api/entry-logs/today/vehicle?page=2
Authorization: Bearer <token>
```

---

## 5. Registros de la Semana - Personal

### `GET /api/entry-logs/week/personal`

Obtiene registros de QR y facial de los últimos 7 días.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | - | Número de página |
| `limit` | number | 50 | 200 | Registros por página |

**Ejemplo 1:** Registros de la semana
```http
GET /api/entry-logs/week/personal
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "qr": [...],
    "facial": [...]
  },
  "meta": {
    "qr": { "total": 234, "page": 1, "limit": 50, "totalPages": 5 },
    "facial": { "total": 89, "page": 1, "limit": 50, "totalPages": 2 }
  },
  "period": {
    "start": "2025-12-03",
    "end": "2025-12-10"
  }
}
```

**Ejemplo 2:** Con límite mayor
```http
GET /api/entry-logs/week/personal?limit=100
Authorization: Bearer <token>
```

---

## 6. Registros de la Semana - Vehículos

### `GET /api/entry-logs/week/vehicle`

Obtiene registros de vehículos de los últimos 7 días.

**Query Parameters:**
| Param | Tipo | Default | Max | Descripción |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | - | Número de página |
| `limit` | number | 50 | 200 | Registros por página |

**Ejemplo 1:** Registros semanales
```http
GET /api/entry-logs/week/vehicle
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 156, "page": 1, "limit": 50, "totalPages": 4 },
  "period": {
    "start": "2025-12-03",
    "end": "2025-12-10"
  }
}
```

**Ejemplo 2:** Página específica
```http
GET /api/entry-logs/week/vehicle?page=3&limit=50
Authorization: Bearer <token>
```

---

## 7. Todos los Entry Logs

### `GET /api/entry-logs/all`

Obtiene todos los registros de acceso con filtros opcionales.

**Query Parameters:**
| Param | Tipo | Default | Valores | Descripción |
|-------|------|---------|---------|-------------|
| `page` | number | 1 | - | Número de página |
| `limit` | number | 50 | max: 200 | Registros por página |
| `method` | string | - | `qr`, `facial`, `vehicle_plate` | Filtrar por método |
| `action` | string | - | `check_in`, `check_out` | Filtrar por acción |
| `startDate` | string | - | `YYYY-MM-DD` | Fecha inicio |
| `endDate` | string | - | `YYYY-MM-DD` | Fecha fin |

**Ejemplo 1:** Todos los entry logs
```http
GET /api/entry-logs/all
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "access",
      "action": "check_in",
      "description": "...",
      "timestamp": "2025-12-10T15:30:00.000Z",
      "details": { "method": "qr", ... }
    }
  ],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "totalPages": 25,
    "filters": {}
  }
}
```

**Ejemplo 2:** Filtrar solo check-ins de QR en un rango de fechas
```http
GET /api/entry-logs/all?method=qr&action=check_in&startDate=2025-12-01&endDate=2025-12-10
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 87,
    "page": 1,
    "limit": 50,
    "totalPages": 2,
    "filters": {
      "method": "qr",
      "action": "check_in",
      "startDate": "2025-12-01",
      "endDate": "2025-12-10"
    }
  }
}
```

---

## Validación de QR de Visitante

### `POST /api/access/validate-visitor-qr`

Valida el QR de un visitante, crea el registro de visitante y genera el log de entrada.

**Body:**
```json
{
  "qrData": "{\"invitationId\":\"uuid\",\"firstName\":\"Juan\",...}"
}
```

**Ejemplo 1:** Validación exitosa
```http
POST /api/access/validate-visitor-qr
Content-Type: application/json

{
  "qrData": "{\"invitationId\":\"550e8400-e29b-41d4-a716-446655440000\",\"firstName\":\"Juan\",\"lastName\":\"Pérez\",\"rut\":\"12345678-9\",\"residentId\":\"660e8400-e29b-41d4-a716-446655440001\",\"scheduledDate\":\"2025-12-10T10:00:00.000Z\",\"hasVehicle\":false}"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Acceso autorizado - Visitante registrado correctamente",
  "data": {
    "visitor": {
      "id": "770e8400-...",
      "firstName": "Juan",
      "lastName": "Pérez",
      "status": "IN_PROPERTY",
      "checkInTime": "2025-12-10T15:30:00.000Z"
    },
    "invitation": {
      "id": "550e8400-...",
      "status": "USED"
    },
    "log": {
      "id": "880e8400-...",
      "action": "check_in"
    },
    "validatedAt": "2025-12-10T15:30:00.000Z"
  }
}
```

**Ejemplo 2:** QR expirado
```http
POST /api/access/validate-visitor-qr
Content-Type: application/json

{
  "qrData": "{\"invitationId\":\"550e8400-...\",\"firstName\":\"Ana\",\"lastName\":\"García\",\"rut\":\"98765432-1\",\"residentId\":\"660e8400-...\"}"
}
```

**Respuesta error (400):**
```json
{
  "success": false,
  "message": "La invitación ha expirado"
}
```

---

## Check-Out de Visitante

### `POST /api/access/visitor/:id/checkout`

Registra la salida de un visitante.

**Ejemplo 1:** Check-out exitoso
```http
POST /api/access/visitor/770e8400-e29b-41d4-a716-446655440000/checkout
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Check-out registrado correctamente",
  "data": {
    "visitor": {
      "id": "770e8400-...",
      "status": "COMPLETED",
      "checkOutTime": "2025-12-10T18:45:00.000Z"
    },
    "log": {
      "id": "990e8400-...",
      "action": "check_out"
    }
  }
}
```

**Ejemplo 2:** Visitante no está en la propiedad
```http
POST /api/access/visitor/770e8400-.../checkout
Authorization: Bearer <token>
```

**Respuesta error (400):**
```json
{
  "success": false,
  "message": "El visitante no está en la propiedad. Estado actual: COMPLETED"
}
```

---

## Requisito para que los Entry Logs funcionen

Al crear logs de acceso, incluir `method` en el campo `details`:

```typescript
// Al crear un log de acceso
{
  type: 'access',
  action: 'check_in', // o 'check_out'
  description: '...',
  details: {
    method: 'qr',           // 'qr' | 'facial' | 'vehicle_plate'
    // ... otros datos
  }
}
```

Valores válidos para `details.method`:
- `qr` - Código QR
- `facial` - Reconocimiento facial  
- `vehicle_plate` - Reconocimiento de patente
