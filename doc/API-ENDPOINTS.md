# Documentación de Endpoints - Guardian Comunitario API

## 📋 Tabla de Contenidos
- [Autenticación](#autenticación)
- [Residentes](#residentes)
- [Visitantes](#visitantes)
- [Invitaciones](#invitaciones)
- [Visitantes Frecuentes](#visitantes-frecuentes)
- [Vehículos](#vehículos)
- [Logs](#logs)
- [QR](#qr)

---

## Autenticación

### POST /api/auth
**Descripción:** Autenticar usuario y obtener token JWT.

**URL:** `POST http://localhost:3000/api/auth`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@guardiancomunitario.cl",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Residentes

### POST /api/resident/add
**Descripción:** Crear un nuevo residente.

**URL:** `POST http://localhost:3000/api/resident/add`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "email": "juan.perez@example.com",
  "password": "password123",
  "phone": "+56912345678",
  "block": "A",
  "lotNumber": "101",
  "role": "resident"
}
```

**Parámetros requeridos:**
- `firstName` (string): Nombre del residente
- `lastName` (string): Apellido del residente
- `rut` (string): RUT chileno con formato XX.XXX.XXX-X
- `email` (string): Email único
- `password` (string): Contraseña
- `phone` (string): Teléfono
- `block` (string): Bloque/torre
- `lotNumber` (string): Número de departamento/casa
- `role` (enum): `resident` | `admin` | `guard`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "email": "juan.perez@example.com",
  "phone": "+56912345678",
  "block": "A",
  "lotNumber": "101",
  "role": "resident",
  "isActive": true,
  "createdAt": "2025-01-21T10:00:00Z",
  "updatedAt": "2025-01-21T10:00:00Z"
}
```

---

### GET /api/resident/all
**Descripción:** Listar todos los residentes.

**URL:** `GET http://localhost:3000/api/resident/all`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "block": "A",
    "lotNumber": "101",
    "isActive": true
  }
]
```

---

### GET /api/resident/search
**Descripción:** Buscar residente por RUT o email.

**URL:** `GET http://localhost:3000/api/resident/search?rut=12.345.678-9`

**Query Parameters:**
- `rut` (string, opcional): RUT del residente
- `email` (string, opcional): Email del residente

**Nota:** Debe proporcionar al menos uno de los dos parámetros.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "email": "juan.perez@example.com",
  "phone": "+56912345678",
  "block": "A",
  "lotNumber": "101"
}
```

---

### GET /api/resident/check-email
**Descripción:** Verificar disponibilidad de email.

**URL:** `GET http://localhost:3000/api/resident/check-email?email=test@example.com`

**Query Parameters:**
- `email` (string, requerido): Email a verificar

**Response:** `200 OK`
```json
{
  "available": true
}
```

---

### GET /api/resident/check-rut
**Descripción:** Verificar disponibilidad de RUT.

**URL:** `GET http://localhost:3000/api/resident/check-rut?rut=12.345.678-9`

**Query Parameters:**
- `rut` (string, requerido): RUT a verificar

**Response:** `200 OK`
```json
{
  "available": false
}
```

---

### GET /api/resident/:id
**Descripción:** Obtener residente por ID.

**URL:** `GET http://localhost:3000/api/resident/{id}`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "email": "juan.perez@example.com",
  "phone": "+56912345678",
  "block": "A",
  "lotNumber": "101",
  "role": "resident",
  "isActive": true
}
```

---

### PATCH /api/resident/:id
**Descripción:** Actualizar datos de residente.

**URL:** `PATCH http://localhost:3000/api/resident/{id}`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Body:**
```json
{
  "firstName": "Juan Carlos",
  "phone": "+56987654321",
  "block": "B"
}
```

**Parámetros opcionales:**
- `firstName` (string)
- `lastName` (string)
- `phone` (string)
- `email` (string)
- `block` (string)
- `lotNumber` (string)

**Response:** `200 OK` - Residente actualizado

---

### DELETE /api/resident/:id
**Descripción:** Eliminar (desactivar) residente.

**URL:** `DELETE http://localhost:3000/api/resident/{id}`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
{
  "message": "Residente eliminado exitosamente"
}
```

---

### GET /api/resident/:id/visitors
**Descripción:** Obtener visitantes de un residente.

**URL:** `GET http://localhost:3000/api/resident/{id}/visitors`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "firstName": "Carlos",
    "lastName": "López",
    "rut": "16.543.210-9",
    "visitPurpose": "Visita social"
  }
]
```

---

### POST /api/resident/:id/visitors/add
**Descripción:** Crear visitante para residente (alternativa).

**URL:** `POST http://localhost:3000/api/resident/{id}/visitors/add`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Body:** Ver [POST /api/visitors/:residentId/add](#post-apivisitorsresidentidadd)

**Nota:** Este endpoint redirige al servicio principal de visitantes.

---

### GET /api/resident/:id/invitations
**Descripción:** Obtener invitaciones de un residente.

**URL:** `GET http://localhost:3000/api/resident/{id}/invitations`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "visitorName": "Carlos López",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "status": "PENDING"
  }
]
```

---

### POST /api/resident/:id/invitations/add
**Descripción:** Crear invitación para residente (alternativa).

**URL:** `POST http://localhost:3000/api/resident/{id}/invitations/add`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Body:** Ver [POST /api/invitations/:residentId/add](#post-apiinvitationsresidentidadd)

---

### GET /api/resident/:id/vehicles
**Descripción:** Obtener vehículos de un residente.

**URL:** `GET http://localhost:3000/api/resident/{id}/vehicles`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "type": "CAR"
  }
]
```

---

### PATCH /api/resident/:id/change-password
**Descripción:** Cambiar contraseña de residente.

**URL:** `PATCH http://localhost:3000/api/resident/{id}/change-password`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Parámetros requeridos:**
- `currentPassword` (string): Contraseña actual
- `newPassword` (string): Nueva contraseña (mínimo 6 caracteres)

**Response:** `200 OK`
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

### GET /api/resident/:id/stats
**Descripción:** Obtener estadísticas de un residente.

**URL:** `GET http://localhost:3000/api/resident/{id}/stats`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
{
  "totalVisitors": 15,
  "totalInvitations": 8,
  "totalVehicles": 2,
  "pendingInvitations": 3,
  "approvedInvitations": 5
}
```

---

### GET /api/resident/:id/frequent-visitors
**Descripción:** Listar visitantes frecuentes (contactos guardados) del residente.

**URL:** `GET http://localhost:3000/api/resident/{id}/frequent-visitors`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Carlos Muñoz",
    "rut": "11.222.333-4",
    "phone": "+56922334455",
    "relationship": "Familiar",
    "visitCount": 5
  }
]
```

---

### POST /api/resident/:id/frequent-visitors
**Descripción:** Crear visitante frecuente (contacto guardado).

**URL:** `POST http://localhost:3000/api/resident/{id}/frequent-visitors`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Body:**
```json
{
  "name": "Carlos Muñoz",
  "rut": "11.222.333-4",
  "phone": "+56922334455",
  "email": "carlos.munoz@example.com",
  "relationship": "Familiar",
  "notes": "Visita todos los fines de semana",
  "vehicleInfo": {
    "licensePlate": "ABCD-12",
    "brand": "Chevrolet",
    "model": "Spark",
    "color": "Azul"
  }
}
```

**Parámetros requeridos:**
- `name` (string): Nombre completo
- `rut` (string): RUT
- `phone` (string): Teléfono
- `relationship` (string): Relación con el residente

**Parámetros opcionales:**
- `email` (string)
- `notes` (string)
- `vehicleInfo` (object): Información del vehículo

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Carlos Muñoz",
  "rut": "11.222.333-4",
  "phone": "+56922334455",
  "email": "carlos.munoz@example.com",
  "relationship": "Familiar",
  "visitCount": 0,
  "lastVisit": null,
  "isActive": true,
  "vehicleInfo": {
    "licensePlate": "ABCD-12",
    "brand": "Chevrolet",
    "model": "Spark",
    "color": "Azul"
  },
  "notes": "Visita todos los fines de semana",
  "residentId": "uuid",
  "createdAt": "2025-01-21T10:00:00Z",
  "updatedAt": "2025-01-21T10:00:00Z"
}
```

---

## Visitantes

### GET /api/visitors/all
**Descripción:** Listar todos los visitantes.

**URL:** `GET http://localhost:3000/api/visitors/all`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Carlos",
      "lastName": "López",
      "rut": "16.543.210-9",
      "phone": "+56922334455",
      "visitPurpose": "Visita social",
      "isActive": true,
      "resident": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez"
      }
    }
  ]
}
```

---

### POST /api/visitors/:residentId/add
**Descripción:** Crear un nuevo visitante.

**URL:** `POST http://localhost:3000/api/visitors/{residentId}/add`

**URL Parameters:**
- `residentId` (uuid, requerido): ID del residente que recibe la visita

**Body:**
```json
{
  "firstName": "Carlos",
  "lastName": "López",
  "rut": "16.543.210-9",
  "phone": "+56922334455",
  "email": "carlos.lopez@example.com",
  "visitPurpose": "Visita social",
  "hasVehicle": true,
  "vehicleInfo": {
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Blanco"
  }
}
```

**Parámetros requeridos:**
- `firstName` (string): Nombre
- `lastName` (string): Apellido
- `rut` (string): RUT
- `phone` (string): Teléfono
- `visitPurpose` (string): Propósito de la visita

**Parámetros opcionales:**
- `email` (string)
- `hasVehicle` (boolean): Default `false`
- `vehicleInfo` (object): Información del vehículo

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Carlos",
    "lastName": "López",
    "rut": "16.543.210-9",
    "phone": "+56922334455",
    "email": "carlos.lopez@example.com",
    "status": "PENDING",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "checkInTime": null,
    "checkOutTime": null,
    "visitPurpose": "Visita social",
    "hasVehicle": true,
    "vehicleInfo": {
      "licensePlate": "ABCD-12",
      "brand": "Toyota",
      "model": "Corolla",
      "color": "Blanco"
    },
    "rejectionReason": null,
    "notes": null,
    "residentId": "uuid",
    "createdAt": "2025-01-25T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  }
}
```

---

### PATCH /api/visitors/:id/status
**Descripción:** Actualizar estado de visitante (activar/desactivar).

**URL:** `PATCH http://localhost:3000/api/visitors/{id}/status`

**URL Parameters:**
- `id` (uuid, requerido): ID del visitante

**Body:**
```json
{
  "isActive": false
}
```

**Parámetros requeridos:**
- `status` (enum): Estado del visitante (`PENDING` | `APPROVED` | `REJECTED` | `CHECKED_IN` | `CHECKED_OUT`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Carlos",
    "lastName": "López",
    "isActive": false
  }
}
```

---

## Invitaciones

### GET /api/invitations/all
**Descripción:** Listar todas las invitaciones.

**URL:** `GET http://localhost:3000/api/invitations/all`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "visitorName": "Carlos Muñoz",
      "visitorRut": "16.543.210-9",
      "scheduledDate": "2025-01-25T14:00:00Z",
      "expirationDate": "2025-01-25T18:00:00Z",
      "status": "PENDING",
      "visitPurpose": "Visita familiar",
      "qrCode": null,
      "resident": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez"
      }
    }
  ]
}
```

---

### POST /api/invitations/:residentId/add
**Descripción:** Crear una nueva invitación. Puede ser manual o usando un visitante frecuente.

**URL:** `POST http://localhost:3000/api/invitations/{residentId}/add`

**URL Parameters:**
- `residentId` (uuid, requerido): ID del residente que crea la invitación

**Opción 1 - Invitación Manual:**
```json
{
  "visitorName": "Carlos Muñoz",
  "visitorRut": "16.543.210-9",
  "visitorPhone": "+56922334455",
  "visitorEmail": "carlos.munoz@example.com",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "expirationDate": "2025-01-25T18:00:00Z",
  "visitPurpose": "Visita familiar",
  "notes": "Traerá dos niños",
  "hasVehicle": false
}
```

**Opción 2 - Con Visitante Frecuente (Autocompletado):**
```json
{
  "frequentVisitorId": "uuid-del-contacto",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "expirationDate": "2025-01-25T18:00:00Z",
  "visitPurpose": "Visita familiar",
  "notes": "Datos autocompletados"
}
```

**Opción 3 - Con Visitante Frecuente + Override:**
```json
{
  "frequentVisitorId": "uuid-del-contacto",
  "visitorPhone": "+56999888777",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "visitPurpose": "Visita urgente"
}
```

**Parámetros para invitación manual:**
- `visitorName` (string): Nombre del visitante
- `visitorRut` (string): RUT
- `visitorPhone` (string): Teléfono
- `scheduledDate` (string ISO): Fecha programada
- `visitPurpose` (string): Propósito

**Parámetros con visitante frecuente:**
- `frequentVisitorId` (uuid): ID del contacto guardado
- `scheduledDate` (string ISO): Fecha programada
- `visitPurpose` (string): Propósito

**Parámetros opcionales:**
- `visitorEmail` (string)
- `expirationDate` (string ISO): Default = scheduledDate
- `notes` (string)
- `hasVehicle` (boolean)
- `vehicleInfo` (object)
- `visitorId` (uuid): ID de visitante existente

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "visitorName": "Carlos Muñoz",
    "visitorRut": "16.543.210-9",
    "visitorPhone": "+56922334455",
    "visitorEmail": "carlos.munoz@example.com",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "expirationDate": "2025-01-25T18:00:00Z",
    "qrCode": null,
    "status": "PENDING",
    "visitPurpose": "Visita familiar",
    "notes": "Traerá dos niños",
    "hasVehicle": false,
    "vehicleInfo": null,
    "checkInTime": null,
    "checkOutTime": null,
    "rejectionReason": null,
    "cancellationReason": null,
    "residentId": "uuid",
    "visitorId": null,
    "createdAt": "2025-01-25T14:00:00Z",
    "updatedAt": "2025-01-25T14:00:00Z"
  }
}
```

---

### GET /api/invitations/:id
**Descripción:** Obtener invitación por ID.

**URL:** `GET http://localhost:3000/api/invitations/{id}`

**URL Parameters:**
- `id` (uuid, requerido): ID de la invitación

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "visitorName": "Carlos Muñoz",
    "visitorRut": "16.543.210-9",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "status": "APPROVED",
    "qrCode": "QR_abc123def456",
    "resident": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez"
    }
  }
}
```

---

### PATCH /api/invitations/:id/approve
**Descripción:** Aprobar invitación y generar código QR.

**URL:** `PATCH http://localhost:3000/api/invitations/{id}/approve`

**URL Parameters:**
- `id` (uuid, requerido): ID de la invitación

**Body (opcional):**
```json
{
  "notes": "Aprobado por administración"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "visitorName": "Carlos Muñoz",
    "status": "APPROVED",
    "qrCode": "QR_abc123def456",
    "scheduledDate": "2025-01-25T14:00:00Z"
  }
}
```

---

### PATCH /api/invitations/:id/reject
**Descripción:** Rechazar invitación.

**URL:** `PATCH http://localhost:3000/api/invitations/{id}/reject`

**URL Parameters:**
- `id` (uuid, requerido): ID de la invitación

**Body (opcional):**
```json
{
  "reason": "Horario no disponible"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "REJECTED",
    "rejectionReason": "Horario no disponible"
  }
}
```

---

### PATCH /api/invitations/:id/cancel
**Descripción:** Cancelar invitación.

**URL:** `PATCH http://localhost:3000/api/invitations/{id}/cancel`

**URL Parameters:**
- `id` (uuid, requerido): ID de la invitación

**Body (opcional):**
```json
{
  "reason": "Visitante no puede asistir"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "cancellationReason": "Visitante no puede asistir"
  }
}
```

---

### PATCH /api/invitations/:id/status
**Descripción:** Actualizar estado de invitación.

**URL:** `PATCH http://localhost:3000/api/invitations/{id}/status`

**URL Parameters:**
- `id` (uuid, requerido): ID de la invitación

**Body:**
```json
{
  "status": "USED"
}
```

**Parámetros requeridos:**
- `status` (enum): `PENDING` | `APPROVED` | `REJECTED` | `USED` | `EXPIRED` | `CANCELLED`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "USED"
  }
}
```

---

## Visitantes Frecuentes

### POST /api/frequent-visitors/:id/create-invitation
**Descripción:** Crear invitación desde visitante frecuente (método alternativo).

**URL:** `POST http://localhost:3000/api/frequent-visitors/{id}/create-invitation`

**URL Parameters:**
- `id` (uuid, requerido): ID del visitante frecuente

**Body:**
```json
{
  "scheduledDate": "2025-01-22T10:00:00Z",
  "expirationDate": "2025-01-22T14:00:00Z",
  "visitPurpose": "Visita regular",
  "notes": "Invitación desde visitante frecuente"
}
```

**Parámetros requeridos:**
- `scheduledDate` (string ISO): Fecha programada
- `visitPurpose` (string): Propósito de la visita

**Parámetros opcionales:**
- `expirationDate` (string ISO)
- `notes` (string)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Muñoz",
    "rut": "11.222.333-4",
    "visitCount": 6
  },
  "invitation": {
    "id": "uuid",
    "visitorName": "Carlos Muñoz",
    "scheduledDate": "2025-01-22T10:00:00Z",
    "status": "PENDING"
  }
}
```

---

### DELETE /api/frequent-visitors/:id
**Descripción:** Eliminar (desactivar) visitante frecuente.

**URL:** `DELETE http://localhost:3000/api/frequent-visitors/{id}`

**URL Parameters:**
- `id` (uuid, requerido): ID del visitante frecuente

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Muñoz",
    "isActive": false
  }
}
```

---

## Vehículos

### POST /api/:id_resident/cars/add
**Descripción:** Registrar un nuevo vehículo.

**URL:** `POST http://localhost:3000/api/{id_resident}/cars/add`

**URL Parameters:**
- `id_resident` (uuid, requerido): ID del residente propietario

**Body:**
```json
{
  "licensePlate": "ABCD-12",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "color": "Blanco",
  "type": "CAR"
}
```

**Parámetros requeridos:**
- `licensePlate` (string): Placa patente
- `brand` (string): Marca
- `model` (string): Modelo
- `type` (enum): `CAR` | `MOTORCYCLE` | `TRUCK` | `VAN` | `OTHER`

**Parámetros opcionales:**
- `year` (number): Año
- `color` (string): Color

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "color": "Blanco",
    "type": "CAR",
    "isActive": true,
    "deleteReason": null,
    "deleteNotes": null,
    "residentId": "uuid",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

---

### GET /api/cars/all
**Descripción:** Listar todos los vehículos con paginación y filtros.

**URL:** `GET http://localhost:3000/api/cars/all?page=1&limit=50`

**Query Parameters (todos opcionales):**
- `page` (number): Página actual (default: 1)
- `limit` (number): Items por página (default: 50, max: 200)
- `ownerId` (uuid): Filtrar por ID de residente
- `type` (enum): Filtrar por tipo de vehículo
- `isActive` (boolean): Filtrar por estado (`true` | `false`)
- `search` (string): Búsqueda por placa, marca o modelo

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "licensePlate": "ABCD-12",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2023,
      "color": "Blanco",
      "type": "CAR",
      "isActive": true,
      "resident": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "block": "A",
        "lotNumber": "101"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### GET /api/cars/:id_car
**Descripción:** Obtener vehículo por ID.

**URL:** `GET http://localhost:3000/api/cars/{id_car}`

**URL Parameters:**
- `id_car` (uuid, requerido): ID del vehículo

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "color": "Blanco",
    "type": "CAR",
    "isActive": true,
    "residentId": "uuid,"
    "resident": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "block": "A",
      "lotNumber": "101"
    }
  }
}
```

---

### PATCH /api/cars/:id/update
**Descripción:** Actualizar datos de vehículo.

**URL:** `PATCH http://localhost:3000/api/cars/{id}/update`

**URL Parameters:**
- `id` (uuid, requerido): ID del vehículo

**Body:**
```json
{
  "color": "Negro",
  "year": 2024
}
```

**Parámetros opcionales:**
- `brand` (string)
- `model` (string)
- `year` (number)
- `color` (string)
- `type` (enum)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "color": "Negro",
    "year": 2024
  }
}
```

---

### PATCH /api/cars/car/:id/delete
**Descripción:** Desactivar vehículo (soft delete).

**URL:** `PATCH http://localhost:3000/api/cars/car/{id}/delete`

**URL Parameters:**
- `id` (uuid, requerido): ID del vehículo

**Body:**
```json
{
  "reason": "Vehículo vendido",
  "notes": "Compró uno nuevo"
}
```

**Parámetros opcionales:**
- `reason` (string): Razón de eliminación
- `notes` (string): Notas adicionales

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isActive": false
  },
  "message": "Vehículo desactivado exitosamente"
}
```

---

### GET /api/cars/search
**Descripción:** Buscar vehículo por placa patente.

**URL:** `GET http://localhost:3000/api/cars/search?plate=ABCD-12`

**Query Parameters:**
- `plate` (string, requerido): Placa patente a buscar

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "type": "CAR",
    "isActive": true
  }
}
```

**Si no encuentra:** `data: null`

---

### GET /api/cars/check-duplicate
**Descripción:** Verificar si placa está duplicada.

**URL:** `GET http://localhost:3000/api/cars/check-duplicate?plate=ABCD-12`

**Query Parameters:**
- `plate` (string, requerido): Placa a verificar
- `excludeId` (uuid, opcional): ID a excluir de la búsqueda

**Response:** `200 OK`
```json
{
  "success": true,
  "isDuplicate": true,
  "existingVehicle": {
    "id": "uuid",
    "licensePlate": "ABCD-12",
    "residentId": "uuid"
  }
}
```

---

### GET /api/residents/:id/vehicles/stats
**Descripción:** Obtener estadísticas de vehículos de un residente.

**URL:** `GET http://localhost:3000/api/residents/{id}/vehicles/stats`

**URL Parameters:**
- `id` (uuid, requerido): ID del residente

**Response:** `200 OK`
```json
{
  "totalVehicles": 2,
  "activeVehicles": 2,
  "inactiveVehicles": 0,
  "vehicleTypes": {
    "CAR": 1,
    "MOTORCYCLE": 1
  }
}
```

---

### PATCH /api/cars/:id/activate
**Descripción:** Reactivar vehículo desactivado.

**URL:** `PATCH http://localhost:3000/api/cars/{id}/activate`

**URL Parameters:**
- `id` (uuid, requerido): ID del vehículo

**Body (opcional):**
```json
{
  "notes": "Vehículo recuperado"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isActive": true
  },
  "message": "Vehículo reactivado exitosamente"
}
```

---

## Logs

**Nota:** Todos los endpoints de logs requieren autenticación JWT (`@UseGuards(JwtAuthGuard)`).

### POST /api/logs/create
**Descripción:** Crear un log manualmente.

**URL:** `POST http://localhost:3000/api/logs/create`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "type": "visitor",
  "action": "check_in",
  "severity": "info",
  "userId": "uuid-del-usuario",
  "entityType": "invitation",
  "entityId": "uuid-de-invitacion",
  "description": "Visitante ingresó al condominio",
  "metadata": {
    "gateLocation": "Puerta principal",
    "guardId": "uuid-del-guardia"
  }
}
```

**Parámetros requeridos:**
- `type` (enum): `system` | `user` | `visitor` | `vehicle` | `security`
- `action` (enum): `create` | `update` | `delete` | `check_in` | `check_out` | `approve` | `reject`
- `severity` (enum): `info` | `warning` | `error` | `critical`

**Parámetros opcionales:**
- `userId` (uuid): ID del usuario que genera el log
- `entityType` (string): Tipo de entidad relacionada
- `entityId` (uuid): ID de la entidad
- `description` (string): Descripción del evento
- `metadata` (object): Datos adicionales

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "message": "Log creado exitosamente",
  "data": {
    "id": "uuid",
    "type": "visitor",
    "action": "check_in",
    "severity": "info",
    "createdAt": "2025-01-21T10:00:00Z"
  }
}
```

---

### GET /api/logs/per_day/:log_type
**Descripción:** Obtener logs del día actual por tipo.

**URL:** `GET http://localhost:3000/api/logs/per_day/{log_type}`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `log_type` (enum, requerido): `system` | `user` | `visitor` | `vehicle` | `security`

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Logs del tipo visitor para el día de hoy",
  "data": [
    {
      "id": "uuid",
      "type": "visitor",
      "action": "check_in",
      "description": "Visitante ingresó",
      "createdAt": "2025-01-21T10:00:00Z"
    }
  ]
}
```

---

### GET /api/logs/all/:log_type
**Descripción:** Obtener todos los logs con filtros y paginación por tipo.

**URL:** `GET http://localhost:3000/api/logs/all/{log_type}?page=1&limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `log_type` (enum, requerido): Tipo de log

**Query Parameters (todos opcionales):**
- `page` (number): Página (default: 1)
- `limit` (number): Items por página (default: 50)
- `action` (enum): Filtrar por acción
- `severity` (string): Filtrar por severidad
- `userId` (uuid): Filtrar por usuario
- `entityType` (string): Filtrar por tipo de entidad
- `startDate` (string ISO): Fecha inicio
- `endDate` (string ISO): Fecha fin

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Logs del tipo visitor obtenidos exitosamente",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "type": "visitor",
        "action": "check_in",
        "severity": "info",
        "createdAt": "2025-01-21T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

### GET /api/logs/all
**Descripción:** Obtener todos los logs sin filtro de tipo.

**URL:** `GET http://localhost:3000/api/logs/all?page=1&limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:** Mismos que el endpoint anterior más:
- `type` (enum): Filtrar por tipo de log

**Response:** Similar al endpoint anterior.

---

### GET /api/logs/:id
**Descripción:** Obtener un log por ID.

**URL:** `GET http://localhost:3000/api/logs/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id` (uuid, requerido): ID del log

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Log encontrado",
  "data": {
    "id": "uuid",
    "type": "visitor",
    "action": "check_in",
    "severity": "info",
    "userId": "uuid",
    "entityType": "invitation",
    "entityId": "uuid",
    "description": "Visitante ingresó",
    "metadata": {
      "gateLocation": "Puerta principal"
    },
    "createdAt": "2025-01-21T10:00:00Z"
  }
}
```

---

### GET /api/logs/user/:userId
**Descripción:** Obtener logs por usuario.

**URL:** `GET http://localhost:3000/api/logs/user/{userId}?page=1&limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `userId` (uuid, requerido): ID del usuario

**Query Parameters:**
- `page` (number): Default 1
- `limit` (number): Default 50

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Logs del usuario {userId}",
  "data": {
    "logs": [...],
    "total": 25,
    "page": 1,
    "limit": 50
  }
}
```

---

### GET /api/logs/entity/:entityType/:entityId
**Descripción:** Obtener logs por entidad.

**URL:** `GET http://localhost:3000/api/logs/entity/{entityType}/{entityId}?page=1&limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `entityType` (string, requerido): Tipo de entidad (ej: "invitation", "vehicle")
- `entityId` (uuid, requerido): ID de la entidad

**Query Parameters:**
- `page` (number): Default 1
- `limit` (number): Default 50

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Logs de invitation con ID {entityId}",
  "data": {
    "logs": [...],
    "total": 8,
    "page": 1,
    "limit": 50
  }
}
```

---

### GET /api/logs/stats
**Descripción:** Obtener estadísticas de logs.

**URL:** `GET http://localhost:3000/api/logs/stats?startDate=2025-01-01&endDate=2025-01-31`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionales):**
- `startDate` (string ISO): Fecha inicio del rango
- `endDate` (string ISO): Fecha fin del rango

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Estadísticas de logs obtenidas",
  "data": {
    "totalLogs": 1250,
    "byType": {
      "system": 300,
      "user": 400,
      "visitor": 350,
      "vehicle": 150,
      "security": 50
    },
    "bySeverity": {
      "info": 1000,
      "warning": 200,
      "error": 45,
      "critical": 5
    },
    "byAction": {
      "create": 400,
      "check_in": 350,
      "check_out": 340,
      "update": 100,
      "delete": 60
    }
  }
}
```

---

### POST /api/logs/clean
**Descripción:** Limpiar logs antiguos.

**URL:** `POST http://localhost:3000/api/logs/clean?daysToKeep=90`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `daysToKeep` (number, opcional): Días a mantener (default: 90)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Limpieza de logs completada",
  "data": {
    "deletedCount": 450,
    "daysKept": 90,
    "oldestRemainingLog": "2024-10-22T10:00:00Z"
  }
}
```

---

## QR

**Nota:** Todos los endpoints de QR requieren autenticación JWT (`@UseGuards(JwtAuthGuard)`).

### POST /api/qr/validate
**Descripción:** Validar código QR sin registrar acción.

**URL:** `POST http://localhost:3000/api/qr/validate`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "qrCode": "QR_abc123def456"
}
```

**Parámetros requeridos:**
- `qrCode` (string): Código QR a validar

**Response:** `200 OK` (válido)
```json
{
  "statusCode": 200,
  "message": "Código QR válido",
  "data": {
    "isValid": true,
    "type": "invitation",
    "invitation": {
      "id": "uuid",
      "visitorName": "Carlos Muñoz",
      "scheduledDate": "2025-01-25T14:00:00Z",
      "status": "APPROVED"
    }
  }
}
```

**Response:** `400 Bad Request` (inválido)
```json
{
  "statusCode": 400,
  "message": "Código QR inválido o expirado",
  "data": {
    "isValid": false,
    "type": null
  }
}
```

---

### POST /api/qr/check-in
**Descripción:** Registrar entrada mediante escaneo de QR.

**URL:** `POST http://localhost:3000/api/qr/check-in`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "qrCode": "QR_abc123def456",
  "guardId": "uuid-del-guardia",
  "gateLocation": "Puerta principal",
  "additionalData": {
    "vehicleLicensePlate": "ABCD-12",
    "notes": "Visitante con paquete"
  }
}
```

**Parámetros requeridos:**
- `qrCode` (string): Código QR
- `guardId` (uuid): ID del guardia que registra

**Parámetros opcionales:**
- `gateLocation` (string): Ubicación de la puerta
- `additionalData` (object): Datos adicionales

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Check-in registrado exitosamente",
  "data": {
    "invitation": {
      "id": "uuid",
      "visitorName": "Carlos Muñoz",
      "checkInTime": "2025-01-25T14:05:00Z",
      "status": "USED"
    },
    "log": {
      "id": "uuid",
      "type": "visitor",
      "action": "check_in",
      "createdAt": "2025-01-25T14:05:00Z"
    }
  }
}
```

---

### POST /api/qr/check-out
**Descripción:** Registrar salida mediante escaneo de QR.

**URL:** `POST http://localhost:3000/api/qr/check-out`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "qrCode": "QR_abc123def456",
  "guardId": "uuid-del-guardia",
  "gateLocation": "Puerta trasera",
  "additionalData": {
    "notes": "Salida normal"
  }
}
```

**Parámetros:** Iguales que check-in

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "message": "Check-out registrado exitosamente",
  "data": {
    "invitation": {
      "id": "uuid",
      "visitorName": "Carlos Muñoz",
      "checkOutTime": "2025-01-25T18:30:00Z",
      "status": "USED"
    },
    "log": {
      "id": "uuid",
      "type": "visitor",
      "action": "check_out",
      "createdAt": "2025-01-25T18:30:00Z"
    }
  }
}
```

---

## 📝 Notas Generales

### Autenticación
Los siguientes módulos requieren autenticación JWT:
- **Logs** (todos los endpoints)
- **QR** (todos los endpoints)

Para autenticarse, incluir el header:
```
Authorization: Bearer {access_token}
```

### Paginación
Los endpoints que soportan paginación aceptan:
- `page` (number): Número de página (default: 1)
- `limit` (number): Items por página (default varía por endpoint)

### Códigos de Estado HTTP
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `400 Bad Request`: Error en los datos enviados
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

### Formatos de Fecha
Todas las fechas deben enviarse en formato ISO 8601:
```
2025-01-25T14:00:00Z
```

### Enums Disponibles

**VisitorStatus:**
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CHECKED_IN`
- `CHECKED_OUT`

**InvitationStatus:**
- `PENDING`
- `APPROVED`
- `REJECTED`
- `USED`
- `EXPIRED`
- `CANCELLED`

**VehicleType:**
- `CAR`
- `MOTORCYCLE`
- `TRUCK`
- `VAN`
- `OTHER`

**LogType:**
- `system`
- `user`
- `visitor`
- `vehicle`
- `security`

**LogAction:**
- `create`
- `update`
- `delete`
- `check_in`
- `check_out`
- `approve`
- `reject`

**ResidentRole (user_role):**
- `resident`
- `admin`
- `guard`

---

## 🚀 Base URL
```
http://localhost:3000
```

Para producción, reemplazar con la URL del servidor desplegado.
