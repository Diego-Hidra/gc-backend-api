# Flujo de Visitantes y Vehículos

## 📋 Tabla de Contenidos
- [Visitantes](#visitantes)
  - [Crear Visitante](#crear-visitante)
  - [Obtener Visitantes](#obtener-visitantes)
- [Visitantes Frecuentes](#visitantes-frecuentes)
  - [Crear Contacto (Visitante Frecuente)](#crear-contacto-visitante-frecuente)
  - [Obtener Contactos](#obtener-contactos)
- [Invitaciones](#invitaciones)
  - [Crear Invitación Manual](#crear-invitación-manual)
  - [Crear Invitación desde Contacto](#crear-invitación-desde-contacto)
  - [Obtener Invitaciones](#obtener-invitaciones)
- [Vehículos](#vehículos)
  - [Crear Vehículo](#crear-vehículo)
  - [Obtener Vehículos](#obtener-vehículos)

---

## Visitantes

### Crear Visitante

**Endpoint:** `POST /api/visitors/:residentId/add`

**Descripción:** Crea un registro de visitante asociado a un residente.

**Request:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "phone": "+56912345678",
  "email": "juan.perez@example.com",
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-visitante",
    "firstName": "Juan",
    "lastName": "Pérez",
    "rut": "12.345.678-9",
    "phone": "+56912345678",
    "email": "juan.perez@example.com",
    "visitPurpose": "Visita social",
    "hasVehicle": true,
    "vehicleInfo": {
      "licensePlate": "ABCD-12",
      "brand": "Toyota",
      "model": "Corolla",
      "color": "Blanco"
    },
    "residentId": "uuid-del-residente",
    "isActive": true,
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

**Postman:** `03. Visitors → 03.2 Crear Visitante`

---

### Obtener Visitantes

#### Listar Todos los Visitantes

**Endpoint:** `GET /api/visitors/all`

**Descripción:** Obtiene lista completa de todos los visitantes del sistema.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-del-visitante",
      "firstName": "Juan",
      "lastName": "Pérez",
      "rut": "12.345.678-9",
      "phone": "+56912345678",
      "visitPurpose": "Visita social",
      "isActive": true,
      "resident": {
        "id": "uuid-del-residente",
        "firstName": "Pedro",
        "lastName": "González"
      }
    }
  ]
}
```

**Postman:** `03. Visitors → 03.1 Listar Todos los Visitantes`

---

## Visitantes Frecuentes

### Crear Contacto (Visitante Frecuente)

**Endpoint:** `POST /api/resident/:id/frequent-visitors`

**Descripción:** Guarda un contacto de visitante frecuente (como un contacto telefónico). Se usa para autocompletar invitaciones futuras.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-contacto",
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
    },
    "visitCount": 0,
    "isActive": true,
    "residentId": "uuid-del-residente",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

**Postman:** `05. Frequent Visitors → 05.1 Agregar Visitante Frecuente`

**💡 Nota:** El ID del contacto (`frequent_visitor_id`) se guarda automáticamente en Postman para usarlo en invitaciones.

---

### Obtener Contactos

**Endpoint:** `GET /api/residents/:id/frequent-visitors`

**Descripción:** Lista todos los contactos guardados de un residente.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-del-contacto",
      "name": "Carlos Muñoz",
      "rut": "11.222.333-4",
      "phone": "+56922334455",
      "relationship": "Familiar",
      "visitCount": 5,
      "lastVisit": "2025-01-20T15:00:00Z",
      "isActive": true
    }
  ]
}
```

**Postman:** `05. Frequent Visitors → 05.2 Listar Visitantes Frecuentes`

---

## Invitaciones

### Crear Invitación Manual

**Endpoint:** `POST /api/invitations/:residentId/add`

**Descripción:** Crea una invitación proporcionando todos los datos manualmente.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-de-invitacion",
    "visitorName": "Carlos Muñoz",
    "visitorRut": "16.543.210-9",
    "visitorPhone": "+56922334455",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "expirationDate": "2025-01-25T18:00:00Z",
    "status": "PENDING",
    "visitPurpose": "Visita familiar",
    "qrCode": null,
    "residentId": "uuid-del-residente"
  }
}
```

**Postman:** `04. Invitations → 04.1 Crear Invitación`

---

### Crear Invitación desde Contacto

**Endpoint:** `POST /api/invitations/:residentId/add`

**Descripción:** Crea invitación usando un contacto guardado. Los datos se autocompletan desde el visitante frecuente.

**Request (Autocompletado):**
```json
{
  "frequentVisitorId": "uuid-del-contacto",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "expirationDate": "2025-01-25T18:00:00Z",
  "visitPurpose": "Visita familiar",
  "notes": "Datos autocompletados desde contacto guardado"
}
```

**Request (Override de campos):**
```json
{
  "frequentVisitorId": "uuid-del-contacto",
  "visitorPhone": "+56999888777",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "visitPurpose": "Visita urgente",
  "notes": "Usa contacto pero cambia el teléfono"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-de-invitacion",
    "visitorName": "Carlos Muñoz",
    "visitorRut": "11.222.333-4",
    "visitorPhone": "+56999888777",
    "scheduledDate": "2025-01-25T14:00:00Z",
    "status": "PENDING",
    "visitPurpose": "Visita urgente",
    "vehicleInfo": {
      "licensePlate": "ABCD-12",
      "brand": "Chevrolet",
      "model": "Spark",
      "color": "Azul"
    },
    "residentId": "uuid-del-residente"
  }
}
```

**Postman:** 
- `04. Invitations → 04.1b Crear Invitación con Visitante Frecuente` (autocompletado)
- `04. Invitations → 04.1c Crear Invitación con Contacto y Override` (sobrescribir campos)

---

### Obtener Invitaciones

**Endpoint:** `GET /api/invitations/all`

**Descripción:** Lista todas las invitaciones del sistema.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-de-invitacion",
      "visitorName": "Carlos Muñoz",
      "visitorRut": "16.543.210-9",
      "scheduledDate": "2025-01-25T14:00:00Z",
      "expirationDate": "2025-01-25T18:00:00Z",
      "status": "PENDING",
      "visitPurpose": "Visita familiar",
      "qrCode": null,
      "resident": {
        "id": "uuid-del-residente",
        "firstName": "Pedro",
        "lastName": "González"
      }
    }
  ]
}
```

**Postman:** `04. Invitations → 04.2 Listar Todas las Invitaciones`

---

## Vehículos

### Crear Vehículo

**Endpoint:** `POST /api/:id_resident/cars/add`

**Descripción:** Registra un vehículo asociado a un residente.

**Request:**
```json
{
  "licensePlate": "ABCD-12",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "color": "Blanco",
  "type": "SEDAN"
}
```

**Tipos de vehículo disponibles:**
- `SEDAN`
- `SUV`
- `PICKUP`
- `MOTORCYCLE`
- `VAN`
- `OTHER`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-vehiculo",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "color": "Blanco",
    "type": "SEDAN",
    "isActive": true,
    "residentId": "uuid-del-residente",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

**Postman:** `06. Vehicles → 06.1 Agregar Vehículo`

---

### Obtener Vehículos

#### Listar Todos los Vehículos

**Endpoint:** `GET /api/cars/all`

**Descripción:** Obtiene lista completa de todos los vehículos registrados.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-del-vehiculo",
      "licensePlate": "ABCD-12",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2023,
      "color": "Blanco",
      "type": "SEDAN",
      "isActive": true,
      "resident": {
        "id": "uuid-del-residente",
        "firstName": "Pedro",
        "lastName": "González",
        "block": "A",
        "lotNumber": "101"
      }
    }
  ]
}
```

**Postman:** `06. Vehicles → 06.2 Listar Todos los Vehículos`

---

#### Obtener Vehículo por ID

**Endpoint:** `GET /api/cars/:id_car`

**Descripción:** Obtiene información detallada de un vehículo específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-vehiculo",
    "licensePlate": "ABCD-12",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "color": "Blanco",
    "type": "SEDAN",
    "isActive": true,
    "residentId": "uuid-del-residente",
    "resident": {
      "id": "uuid-del-residente",
      "firstName": "Pedro",
      "lastName": "González",
      "block": "A",
      "lotNumber": "101"
    }
  }
}
```

**Postman:** `06. Vehicles → 06.3 Obtener Vehículo por ID`

---

#### Buscar Vehículos

**Endpoint:** `GET /api/cars/search?query=toyota`

**Descripción:** Busca vehículos por placa, marca o modelo.

**Query Params:**
- `query`: Término de búsqueda

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-del-vehiculo",
      "licensePlate": "ABCD-12",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2023,
      "type": "SEDAN",
      "isActive": true
    }
  ]
}
```

**Postman:** `06. Vehicles → 06.6 Buscar Vehículos`

---

## 🔄 Flujo Completo Recomendado

### Escenario 1: Visitante Nuevo (Sin Contacto Guardado)

1. **Buscar Residente:**
   - `GET /api/resident/search?rut=12.345.678-9`
   - Guardar `resident_id`

2. **Crear Invitación Manual:**
   - `POST /api/invitations/:residentId/add`
   - Llenar todos los datos del visitante

3. **Aprobar Invitación:**
   - `PATCH /api/invitations/:invitationId/approve`
   - Se genera código QR

### Escenario 2: Visitante Frecuente (Con Contacto)

1. **Buscar Residente:**
   - `GET /api/resident/search?rut=12.345.678-9`
   - Guardar `resident_id`

2. **Guardar Contacto (Primera vez):**
   - `POST /api/resident/:id/frequent-visitors`
   - Guardar `frequent_visitor_id`

3. **Crear Invitación desde Contacto (Visitas posteriores):**
   - `POST /api/invitations/:residentId/add`
   - Usar `frequentVisitorId` en el body
   - Datos se autocompletan

4. **Aprobar Invitación:**
   - `PATCH /api/invitations/:invitationId/approve`
   - Se genera código QR

### Escenario 3: Registrar Vehículo de Residente

1. **Buscar Residente:**
   - `GET /api/resident/search?rut=12.345.678-9`
   - Guardar `resident_id`

2. **Crear Vehículo:**
   - `POST /api/:id_resident/cars/add`
   - Proporcionar datos del vehículo

3. **Verificar Registro:**
   - `GET /api/cars/all`
   - Buscar el vehículo creado

---

## 📝 Notas Importantes

### Visitantes vs Visitantes Frecuentes

- **Visitor (Visitante):** Registro histórico de una visita real que ocurrió
- **FrequentVisitor (Contacto):** Datos guardados para reutilizar (como un contacto telefónico)
- **Invitation (Invitación):** Visita programada con fecha, puede usar datos de un contacto

### Estados de Invitación

- `PENDING`: Esperando aprobación
- `APPROVED`: Aprobada, con código QR generado
- `REJECTED`: Rechazada
- `USED`: Ya fue utilizada (visitante ingresó)
- `EXPIRED`: Expiró la fecha
- `CANCELLED`: Cancelada por el residente

### Vehículos en Invitaciones

Los vehículos pueden incluirse en invitaciones de dos formas:
1. **Campo `vehicleInfo`:** Info temporal del vehículo del visitante
2. **Vehículos registrados:** Vehículos permanentes del residente en tabla `vehicles`

---

## 🚀 Variables de Entorno en Postman

Asegúrate de tener configuradas:
- `base_url`: `http://localhost:3000`
- `resident_id`: Se guarda automáticamente al buscar residente
- `frequent_visitor_id`: Se guarda al crear contacto
- `invitation_id`: Se guarda al crear invitación
- `vehicle_id`: Se guarda al crear vehículo
- `qr_code`: Se guarda al aprobar invitación
