# Guardian Comunitario - Database Schema

**Database**: `guardian_comunitario`  
**User**: `postgres`  
**Password**: `password123`  
**Type**: PostgreSQL 18

---

## 📋 Tables Overview

### 1. **residents** (Residentes)
Tabla principal de usuarios residentes del condominio.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único del residente |
| `email` | varchar | NO | - | Email único del residente |
| `password` | varchar | NO | - | Contraseña hasheada (bcrypt) |
| `firstName` | varchar | NO | - | Nombre del residente |
| `lastName` | varchar | NO | - | Apellido del residente |
| `rut` | varchar(20) | NO | - | RUT chileno único |
| `phone` | varchar(20) | YES | - | Teléfono de contacto |
| `role` | user_role | NO | 'resident' | Rol del usuario (resident, admin, guard) |
| `isActive` | boolean | NO | true | Estado activo/inactivo |
| `block` | varchar(10) | NO | - | Bloque del condominio |
| `lotNumber` | varchar(10) | NO | - | Número de lote/departamento |
| `createdAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de última actualización |

**Indexes**: 
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (rut)

---

### 2. **visitors** (Visitantes)
Registro de visitantes programados y sus estados.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único del visitante |
| `firstName` | varchar | NO | - | Nombre del visitante |
| `lastName` | varchar | NO | - | Apellido del visitante |
| `rut` | varchar(20) | NO | - | RUT del visitante |
| `phone` | varchar(20) | YES | - | Teléfono del visitante |
| `email` | varchar | YES | - | Email del visitante |
| `status` | visitor_status | NO | 'PENDING' | Estado: PENDING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT |
| `scheduledDate` | timestamp | NO | - | Fecha y hora programada de visita |
| `checkInTime` | timestamp | YES | - | Hora real de ingreso |
| `checkOutTime` | timestamp | YES | - | Hora real de salida |
| `visitPurpose` | text | YES | - | Propósito de la visita |
| `hasVehicle` | boolean | NO | false | Indica si trae vehículo |
| `vehicleInfo` | jsonb | YES | - | Información del vehículo (JSON) |
| `rejectionReason` | text | YES | - | Razón de rechazo si aplica |
| `notes` | text | YES | - | Notas adicionales |
| `residentId` | uuid | NO | - | FK a residents(id) |
| `createdAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de última actualización |

**Foreign Keys**:
- `residentId` → `residents(id)`

---

### 3. **invitations** (Invitaciones)
Invitaciones generadas por residentes con códigos QR.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único de la invitación |
| `visitorName` | varchar | NO | - | Nombre completo del visitante |
| `visitorRut` | varchar(20) | NO | - | RUT del visitante invitado |
| `visitorPhone` | varchar | YES | - | Teléfono del visitante |
| `visitorEmail` | varchar | YES | - | Email del visitante |
| `scheduledDate` | timestamp | NO | - | Fecha programada de visita |
| `expirationDate` | timestamp | YES | - | Fecha de expiración del QR |
| `qrCode` | text | YES | - | Código QR generado |
| `status` | invitation_status | NO | 'PENDING' | PENDING, APPROVED, REJECTED, USED, CANCELLED, EXPIRED |
| `visitPurpose` | text | YES | - | Propósito de la visita |
| `notes` | text | YES | - | Notas adicionales sobre la visita |
| `hasVehicle` | boolean | NO | false | Indica si el visitante trae vehículo |
| `vehicleInfo` | jsonb | YES | - | Información del vehículo (licensePlate, brand, model, color) |
| `checkInTime` | timestamp | YES | - | Hora de check-in |
| `checkOutTime` | timestamp | YES | - | Hora de check-out |
| `rejectionReason` | text | YES | - | Razón de rechazo |
| `cancellationReason` | text | YES | - | Razón de cancelación |
| `residentId` | uuid | NO | - | FK a residents(id) |
| `visitorId` | uuid | YES | - | FK a visitors(id) si aplica |
| `createdAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de última actualización |

**Foreign Keys**:
- `residentId` → `residents(id)`
- `visitorId` → `visitors(id)` (nullable)

---

### 4. **frequent_visitors** (Visitantes Frecuentes)
Lista de visitantes frecuentes preaprobados por residentes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único |
| `name` | varchar | NO | - | Nombre completo del visitante frecuente |
| `rut` | varchar(20) | NO | - | RUT del visitante |
| `phone` | varchar(20) | YES | - | Teléfono de contacto |
| `email` | varchar | YES | - | Email del visitante frecuente |
| `relationship` | varchar | YES | - | Relación con el residente (ej: "Familiar", "Empleado") |
| `visitCount` | integer | NO | 0 | Contador de visitas realizadas |
| `lastVisit` | timestamp | YES | - | Fecha de última visita |
| `isActive` | boolean | NO | true | Estado activo/inactivo |
| `vehicleInfo` | jsonb | YES | - | Información de vehículos autorizados |
| `notes` | text | YES | - | Notas adicionales |
| `residentId` | uuid | NO | - | FK a residents(id) |
| `createdAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de creación |
| `updatedAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de última actualización |

**Foreign Keys**:
- `residentId` → `residents(id)`

---

### 5. **vehicles** (Vehículos)
Registro de vehículos de residentes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único del vehículo |
| `licensePlate` | varchar | NO | - | Patente única del vehículo |
| `brand` | varchar | NO | - | Marca (ej: Toyota, Chevrolet) |
| `model` | varchar | NO | - | Modelo del vehículo |
| `year` | integer | NO | - | Año de fabricación |
| `color` | varchar | NO | - | Color del vehículo |
| `type` | vehicle_type | NO | - | CAR, MOTORCYCLE, TRUCK, VAN, OTHER |
| `isActive` | boolean | NO | true | Estado activo (soft delete) |
| `deleteReason` | text | YES | - | Razón de eliminación |
| `deleteNotes` | text | YES | - | Notas sobre eliminación |
| `residentId` | uuid | NO | - | FK a residents(id) |
| `createdAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de registro |
| `updatedAt` | timestamp | NO | CURRENT_TIMESTAMP | Fecha de actualización |

**Foreign Keys**:
- `residentId` → `residents(id)`

**Indexes**:
- UNIQUE (licensePlate)

---

### 6. **logs** (Registros de Auditoría)
Sistema de logging para auditoría y trazabilidad.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | ID único del log |
| `type` | log_type | NO | - | SYSTEM, USER, VISITOR, SECURITY, ERROR |
| `action` | log_action | NO | - | Acción realizada (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| `description` | varchar | NO | - | Descripción de la acción |
| `userId` | varchar | YES | - | ID del usuario que realizó la acción |
| `entityType` | varchar | YES | - | Tipo de entidad afectada (resident, visitor, etc.) |
| `entityId` | varchar | YES | - | ID de la entidad afectada |
| `details` | jsonb | YES | - | Detalles adicionales en JSON |
| `metadata` | jsonb | YES | - | Metadatos adicionales |
| `ipAddress` | varchar | YES | - | Dirección IP de origen |
| `userAgent` | varchar | YES | - | User agent del navegador |
| `timestamp` | timestamp | NO | CURRENT_TIMESTAMP | Fecha y hora del evento |
| `severity` | varchar | NO | 'info' | Severidad: info, warning, error, critical |

---

## 🔍 Views (Vistas)

### 7. **active_visitors_today**
Vista que muestra visitantes activos del día actual.

### 8. **pending_invitations**
Vista que muestra invitaciones pendientes de aprobación.

### 9. **vehicle_stats**
Vista con estadísticas de vehículos por residente.

---

## 📊 Custom Types (ENUMs)

### user_role
```sql
'resident' | 'admin' | 'guard'
```

### visitor_status
```sql
'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT'
```

### invitation_status
```sql
'PENDING' | 'APPROVED' | 'REJECTED' | 'USED' | 'CANCELLED' | 'EXPIRED'
```

### vehicle_type
```sql
'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN' | 'OTHER'
```

### log_type
```sql
'SYSTEM' | 'USER' | 'VISITOR' | 'SECURITY' | 'ERROR'
```

### log_action
```sql
'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS_GRANTED' | 'ACCESS_DENIED'
```

---

## 🔗 Relationships

```
residents (1) ----< (N) visitors
residents (1) ----< (N) invitations  
residents (1) ----< (N) frequent_visitors
residents (1) ----< (N) vehicles
residents (1) ----< (N) logs

invitations (1) ----< (0..1) visitors
```

---

## 📝 Important Notes

1. **Case Sensitivity**: Column names like `firstName`, `lastName`, `isActive` use camelCase and **MUST** be quoted in SQL queries: `"firstName"`

2. **UUID Generation**: All tables use `uuid_generate_v4()` for primary keys. Ensure `uuid-ossp` extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

3. **Timestamps**: `createdAt` and `updatedAt` are automatically set. Consider adding triggers for `updatedAt`.

4. **Soft Deletes**: `residents`, `vehicles`, and `frequent_visitors` use `isActive` flag instead of hard deletes.

5. **Foreign Key Cascades**: Review cascade behavior for deletions (currently not specified in schema).

---

## 🔧 Sample Data Requirements

For testing, ensure you have at least:
- 3 residents with valid RUTs (format: 12.345.678-9)
- Each resident should have unique email and RUT
- At least one resident with hashed password for login testing
- Test data should include residents in different blocks/lots

---

## 📝 Example Data

### 1. **residents** Example

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "juan.perez@email.com",
  "password": "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "phone": "+56912345678",
  "role": "resident",
  "isActive": true,
  "block": "A",
  "lotNumber": "101",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. **visitors** Example

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "firstName": "María",
  "lastName": "González",
  "rut": "18.765.432-1",
  "phone": "+56987654321",
  "email": "maria.gonzalez@email.com",
  "status": "CHECKED_IN",
  "scheduledDate": "2024-11-21T14:00:00.000Z",
  "checkInTime": "2024-11-21T14:05:00.000Z",
  "checkOutTime": null,
  "visitPurpose": "Reunión familiar",
  "hasVehicle": true,
  "vehicleInfo": {
    "licensePlate": "ABCD12",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Blanco"
  },
  "rejectionReason": null,
  "notes": "Visitante frecuente, familia directa",
  "residentId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-11-20T09:15:00.000Z",
  "updatedAt": "2024-11-21T14:05:00.000Z"
}
```

---

### 3. **invitations** Example

```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "visitorName": "Carlos Rodríguez",
  "visitorRut": "16.543.210-K",
  "visitorPhone": "+56976543210",
  "visitorEmail": "carlos.rodriguez@email.com",
  "scheduledDate": "2024-11-22T16:00:00.000Z",
  "expirationDate": "2024-11-22T23:59:59.000Z",
  "qrCode": "INV-2024-11-22-123e4567",
  "status": "PENDING",
  "visitPurpose": "Entrega de paquete",
  "notes": "Delivery de compra online",
  "hasVehicle": false,
  "vehicleInfo": null,
  "checkInTime": null,
  "checkOutTime": null,
  "rejectionReason": null,
  "cancellationReason": null,
  "residentId": "123e4567-e89b-12d3-a456-426614174000",
  "visitorId": null,
  "createdAt": "2024-11-21T10:30:00.000Z",
  "updatedAt": "2024-11-21T10:30:00.000Z"
}
```

---

### 4. **frequent_visitors** Example

```json
{
  "id": "423e4567-e89b-12d3-a456-426614174003",
  "name": "Pedro Sánchez",
  "rut": "14.987.654-3",
  "phone": "+56965432109",
  "email": "pedro.sanchez@email.com",
  "relationship": "Empleado doméstico",
  "visitCount": 45,
  "lastVisit": "2024-11-20T08:30:00.000Z",
  "isActive": true,
  "vehicleInfo": {
    "vehicles": [
      {
        "licensePlate": "WXYZ98",
        "brand": "Suzuki",
        "model": "Swift",
        "color": "Rojo"
      }
    ]
  },
  "notes": "Trabaja de lunes a viernes, 8:00 AM - 5:00 PM",
  "residentId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-06-01T09:00:00.000Z",
  "updatedAt": "2024-11-20T08:30:00.000Z"
}
```

---

### 5. **vehicles** Example

```json
{
  "id": "523e4567-e89b-12d3-a456-426614174004",
  "licensePlate": "GGRT45",
  "brand": "Chevrolet",
  "model": "Onix",
  "year": 2022,
  "color": "Gris",
  "type": "CAR",
  "isActive": true,
  "deleteReason": null,
  "deleteNotes": null,
  "residentId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-20T11:00:00.000Z",
  "updatedAt": "2024-01-20T11:00:00.000Z"
}
```

**Example of Soft-Deleted Vehicle:**

```json
{
  "id": "623e4567-e89b-12d3-a456-426614174005",
  "licensePlate": "KLMN67",
  "brand": "Nissan",
  "model": "Versa",
  "year": 2018,
  "color": "Azul",
  "type": "CAR",
  "isActive": false,
  "deleteReason": "Vehículo vendido",
  "deleteNotes": "Residente vendió el vehículo en octubre 2024",
  "residentId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2022-03-10T14:20:00.000Z",
  "updatedAt": "2024-10-15T09:45:00.000Z"
}
```

---

### 6. **logs** Example

```json
{
  "id": "723e4567-e89b-12d3-a456-426614174006",
  "type": "VISITOR",
  "action": "ACCESS_GRANTED",
  "description": "Visitante María González ingresó al condominio",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "entityType": "visitor",
  "entityId": "223e4567-e89b-12d3-a456-426614174001",
  "details": {
    "visitorName": "María González",
    "visitorRut": "18.765.432-1",
    "residentName": "Juan Pérez",
    "checkInTime": "2024-11-21T14:05:00.000Z",
    "hasVehicle": true,
    "vehiclePlate": "ABCD12"
  },
  "metadata": {
    "guardName": "Guardia Principal",
    "gate": "Entrada Norte",
    "checkType": "QR_SCAN"
  },
  "ipAddress": "192.168.1.105",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
  "timestamp": "2024-11-21T14:05:30.000Z",
  "severity": "info"
}
```

**Example of Error Log:**

```json
{
  "id": "823e4567-e89b-12d3-a456-426614174007",
  "type": "ERROR",
  "action": "LOGIN",
  "description": "Intento de login fallido - credenciales incorrectas",
  "userId": null,
  "entityType": "resident",
  "entityId": null,
  "details": {
    "email": "usuario.invalido@email.com",
    "reason": "Invalid credentials",
    "attemptNumber": 3
  },
  "metadata": {
    "loginMethod": "email_password",
    "clientType": "mobile_app"
  },
  "ipAddress": "203.0.113.45",
  "userAgent": "Guardian-Mobile-App/1.0.0 (Android 12)",
  "timestamp": "2024-11-21T15:30:22.000Z",
  "severity": "warning"
}
```

---

## 💡 Usage Examples

### Creating a Resident with Password

```typescript
// Password: "MiPassword123"
// Hashed with bcrypt (10 rounds)
const hashedPassword = "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW";

const newResident = {
  email: "nuevo.residente@email.com",
  password: hashedPassword,
  firstName: "Ana",
  lastName: "Martínez",
  rut: "19.876.543-2",
  phone: "+56923456789",
  block: "B",
  lotNumber: "205"
};
```

### Creating an Invitation with QR

```typescript
const invitation = {
  visitorName: "Roberto Silva",
  visitorRut: "17.654.321-8",
  visitorPhone: "+56945678901",
  scheduledDate: new Date("2024-11-23T10:00:00Z"),
  expirationDate: new Date("2024-11-23T23:59:59Z"),
  qrCode: `INV-${Date.now()}-${uuidv4()}`,
  status: "PENDING",
  visitPurpose: "Visita social",
  hasVehicle: true,
  vehicleInfo: {
    licensePlate: "PQRS78",
    brand: "Mazda",
    model: "3",
    color: "Negro"
  },
  residentId: "123e4567-e89b-12d3-a456-426614174000"
};
```

### Query Examples

```sql
-- Get all active visitors today
SELECT * FROM visitors 
WHERE status = 'CHECKED_IN' 
  AND DATE("checkInTime") = CURRENT_DATE;

-- Get resident's vehicles
SELECT * FROM vehicles 
WHERE "residentId" = '123e4567-e89b-12d3-a456-426614174000' 
  AND "isActive" = true;

-- Get pending invitations
SELECT * FROM invitations 
WHERE status = 'PENDING' 
  AND "scheduledDate" >= CURRENT_TIMESTAMP;

-- Get frequent visitors by resident
SELECT * FROM frequent_visitors 
WHERE "residentId" = '123e4567-e89b-12d3-a456-426614174000' 
  AND "isActive" = true
ORDER BY "visitCount" DESC;

-- Get security logs from last 24 hours
SELECT * FROM logs 
WHERE type = 'SECURITY' 
  AND timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```
