# 🗄️ Esquema de Base de Datos - Guardian Comunitario

## 📋 Información General

**Motor de Base de Datos:** PostgreSQL 18  
**ORM:** TypeORM  
**Estrategia:** Single Table Inheritance (para usuarios)  
**Última actualización:** 3 de diciembre de 2025

---

## 📊 Tablas

### 1. **users** (Tabla principal de usuarios con herencia)

Tabla base que contiene todos los tipos de usuarios del sistema mediante Single Table Inheritance.

| Campo           | Tipo        | Nullable | Default              | Descripción                                             |
|-----------------|-------------|----------|----------------------|---------------------------------------------------------|
| `id`            | UUID        | NO       | Auto                 | Identificador único (PK)                                |
| `rut`           | VARCHAR     | NO       | -                    | RUT del usuario                                         |
| `name`          | VARCHAR     | NO       | -                    | Nombre del usuario                                      |
| `lastname`      | VARCHAR     | NO       | -                    | Apellido del usuario                                    |
| `email`         | VARCHAR     | NO       | -                    | Correo electrónico                                      |
| `password`      | VARCHAR     | NO       | -                    | Contraseña hasheada (bcrypt)                            |
| `user_type`     | VARCHAR     | NO       | 'user'               | Discriminador: 'RESIDENT', 'ADMIN', 'GUARD'             |
| `phone_number`  | VARCHAR     | SÍ       | -                    | Teléfono (solo RESIDENT, ADMIN, GUARD)                  |
| `floor`         | VARCHAR     | SÍ       | -                    | Piso (solo RESIDENT)                                    |
| `apartament`    | VARCHAR     | SÍ       | -                    | Número de departamento (solo RESIDENT)                  |
| `roles`         | TEXT        | SÍ       | -                    | Roles separados por coma (solo ADMIN)                   |

**Índices:**
- Primary Key: `id`
- Discriminador: `user_type`

**Tipos de Usuario:**
- **RESIDENT**: Usuario residente del condominio (incluye `phone_number`, `floor`, `apartament`)
- **ADMIN**: Usuario administrador (incluye `phone_number`, `roles[]`)
- **GUARD**: Usuario guardia (incluye `phone_number`)

**Relaciones:**
- `resident` → Muchos `visitors` (un residente puede tener múltiples visitantes)
- `resident` → Muchos `invitations` (un residente puede crear múltiples invitaciones)
- `resident` → Muchos `vehicles` (un residente puede tener múltiples vehículos)
- `resident` → Muchos `frequent_visitors` (un residente puede tener múltiples visitantes frecuentes)

---

### 2. **visitors**

Registro de visitantes al condominio.

| Campo            | Tipo        | Nullable | Default     | Descripción                                             |
|------------------|-------------|----------|-------------|---------------------------------------------------------|
| `id`             | UUID        | NO       | Auto        | Identificador único (PK)                                |
| `firstName`      | VARCHAR     | NO       | -           | Nombre del visitante                                    |
| `lastName`       | VARCHAR     | NO       | -           | Apellido del visitante                                  |
| `rut`            | VARCHAR     | NO       | -           | RUT del visitante                                       |
| `phone`          | VARCHAR     | NO       | -           | Teléfono de contacto                                    |
| `email`          | VARCHAR     | SÍ       | NULL        | Correo electrónico                                      |
| `status`         | ENUM        | NO       | 'PENDING'   | Estado: PENDING, APPROVED, REJECTED, IN_PROPERTY, etc.  |
| `visitPurpose`   | VARCHAR     | NO       | -           | Motivo de la visita                                     |
| `scheduledDate`  | TIMESTAMP   | NO       | -           | Fecha/hora programada de visita                         |
| `checkInTime`    | TIMESTAMP   | SÍ       | NULL        | Hora de ingreso real                                    |
| `checkOutTime`   | TIMESTAMP   | SÍ       | NULL        | Hora de salida real                                     |
| `hasVehicle`     | BOOLEAN     | NO       | false       | Indica si trae vehículo                                 |
| `vehicleInfo`    | JSONB       | SÍ       | NULL        | Info del vehículo (JSON)                                |
| `notes`          | VARCHAR     | SÍ       | NULL        | Notas adicionales                                       |
| `residentId`     | UUID        | NO       | -           | ID del residente que autoriza (FK → users.id)           |
| `createdAt`      | TIMESTAMP   | NO       | NOW()       | Fecha de creación                                       |
| `updatedAt`      | TIMESTAMP   | NO       | NOW()       | Fecha de última actualización                           |

**Relaciones:**
- `residentId` → `users.id` (ManyToOne)

**Índices:**
- Primary Key: `id`
- Foreign Key: `residentId`

---

### 3. **invitations**

Invitaciones creadas por residentes para sus visitantes.

| Campo                | Tipo        | Nullable | Default     | Descripción                                             |
|----------------------|-------------|----------|-------------|---------------------------------------------------------|
| `id`                 | UUID        | NO       | Auto        | Identificador único (PK)                                |
| `visitorName`        | VARCHAR     | NO       | -           | Nombre completo del visitante                           |
| `visitorRut`         | VARCHAR     | NO       | -           | RUT del visitante                                       |
| `visitorPhone`       | VARCHAR     | NO       | -           | Teléfono del visitante                                  |
| `visitorEmail`       | VARCHAR     | SÍ       | NULL        | Email del visitante                                     |
| `scheduledDate`      | TIMESTAMP   | NO       | -           | Fecha programada de visita                              |
| `expirationDate`     | TIMESTAMP   | NO       | -           | Fecha de expiración de la invitación                    |
| `qrCode`             | VARCHAR     | SÍ       | NULL        | Código QR generado                                      |
| `status`             | ENUM        | NO       | 'PENDING'   | PENDING, APPROVED, REJECTED, USED, EXPIRED, CANCELLED   |
| `visitPurpose`       | VARCHAR     | NO       | -           | Propósito de la visita                                  |
| `notes`              | VARCHAR     | SÍ       | NULL        | Notas adicionales                                       |
| `hasVehicle`         | BOOLEAN     | NO       | false       | Indica si trae vehículo                                 |
| `vehicleInfo`        | JSONB       | SÍ       | NULL        | Info del vehículo (JSON)                                |
| `checkInTime`        | TIMESTAMP   | SÍ       | NULL        | Hora de entrada                                         |
| `checkOutTime`       | TIMESTAMP   | SÍ       | NULL        | Hora de salida                                          |
| `rejectionReason`    | VARCHAR     | SÍ       | NULL        | Razón de rechazo                                        |
| `cancellationReason` | VARCHAR     | SÍ       | NULL        | Razón de cancelación                                    |
| `residentId`         | UUID        | NO       | -           | ID del residente (FK → users.id)                        |
| `visitorId`          | UUID        | SÍ       | NULL        | ID del visitante registrado (FK → visitors.id)          |
| `createdAt`          | TIMESTAMP   | NO       | NOW()       | Fecha de creación                                       |
| `updatedAt`          | TIMESTAMP   | NO       | NOW()       | Fecha de última actualización                           |

**Relaciones:**
- `residentId` → `users.id` (ManyToOne)
- `visitorId` → `visitors.id` (ManyToOne, opcional)

**Índices:**
- Primary Key: `id`
- Foreign Keys: `residentId`, `visitorId`
- Index: `status`, `scheduledDate`

---

### 4. **vehicles**

Registro de vehículos de los residentes.

| Campo           | Tipo        | Nullable | Default | Descripción                                                      |
|-----------------|-------------|----------|---------|------------------------------------------------------------------|
| `id`            | UUID        | NO       | Auto    | Identificador único (PK)                                         |
| `licensePlate`  | VARCHAR     | NO       | -       | Patente del vehículo (UNIQUE)                                    |
| `brand`         | VARCHAR     | NO       | -       | Marca del vehículo                                               |
| `model`         | VARCHAR     | NO       | -       | Modelo del vehículo                                              |
| `year`          | INTEGER     | NO       | -       | Año del vehículo                                                 |
| `color`         | VARCHAR     | NO       | -       | Color del vehículo                                               |
| `type`          | ENUM        | NO       | 'SEDAN' | SEDAN, SUV, HATCHBACK, PICKUP, VAN, MOTORCYCLE, OTHER            |
| `isActive`      | BOOLEAN     | NO       | true    | Estado activo/eliminado lógicamente                              |
| `deleteReason`  | VARCHAR     | SÍ       | NULL    | Razón de eliminación                                             |
| `deleteNotes`   | VARCHAR     | SÍ       | NULL    | Notas sobre la eliminación                                       |
| `residentId`    | UUID        | NO       | -       | ID del residente propietario (FK → users.id)                     |
| `createdAt`     | TIMESTAMP   | NO       | NOW()   | Fecha de registro                                                |
| `updatedAt`     | TIMESTAMP   | NO       | NOW()   | Fecha de última actualización                                    |

**Relaciones:**
- `residentId` → `users.id` (ManyToOne)

**Índices:**
- Primary Key: `id`
- Unique: `licensePlate`
- Foreign Key: `residentId`

---

### 5. **frequent_visitors**

Visitantes frecuentes registrados por residentes.

| Campo          | Tipo        | Nullable | Default | Descripción                                                      |
|----------------|-------------|----------|---------|------------------------------------------------------------------|
| `id`           | UUID        | NO       | Auto    | Identificador único (PK)                                         |
| `name`         | VARCHAR     | NO       | -       | Nombre completo                                                  |
| `rut`          | VARCHAR     | NO       | -       | RUT del visitante                                                |
| `phone`        | VARCHAR     | NO       | -       | Teléfono                                                         |
| `email`        | VARCHAR     | SÍ       | NULL    | Email                                                            |
| `relationship` | VARCHAR     | NO       | -       | Relación con el residente (familiar, amigo, etc.)                |
| `visitCount`   | INTEGER     | NO       | 0       | Contador de visitas realizadas                                   |
| `lastVisit`    | TIMESTAMP   | SÍ       | NULL    | Fecha de última visita                                           |
| `notes`        | VARCHAR     | SÍ       | NULL    | Notas adicionales                                                |
| `vehicleInfo`  | JSONB       | SÍ       | NULL    | Info de vehículo (JSON)                                          |
| `isActive`     | BOOLEAN     | NO       | true    | Estado activo/inactivo                                           |
| `residentId`   | UUID        | NO       | -       | ID del residente (FK → users.id)                                 |
| `createdAt`    | TIMESTAMP   | NO       | NOW()   | Fecha de creación                                                |
| `updatedAt`    | TIMESTAMP   | NO       | NOW()   | Fecha de última actualización                                    |

**Relaciones:**
- `residentId` → `users.id` (ManyToOne)

**Índices:**
- Primary Key: `id`
- Foreign Key: `residentId`

---

### 6. **logs**

Registro de auditoría y eventos del sistema.

| Campo        | Tipo         | Nullable | Default | Descripción                                                      |
|--------------|--------------|----------|---------|------------------------------------------------------------------|
| `id`         | UUID         | NO       | Auto    | Identificador único (PK)                                         |
| `type`       | ENUM         | NO       | -       | access, visitor, vehicle, incident, system                       |
| `action`     | ENUM         | NO       | -       | Acción específica realizada (ver enum LogAction)                 |
| `description`| VARCHAR(500) | NO       | -       | Descripción del evento                                           |
| `userId`     | UUID         | SÍ       | NULL    | ID del usuario que realizó la acción (FK → users.id)             |
| `entityType` | VARCHAR(100) | SÍ       | NULL    | Tipo de entidad afectada (visitor, vehicle, etc.)                |
| `entityId`   | UUID         | SÍ       | NULL    | ID de la entidad afectada                                        |
| `details`    | JSONB        | SÍ       | NULL    | Detalles adicionales del evento                                  |
| `metadata`   | JSONB        | SÍ       | NULL    | Metadata (IP, dispositivo, navegador, etc.)                      |
| `ipAddress`  | VARCHAR(45)  | SÍ       | NULL    | Dirección IP del cliente                                         |
| `userAgent`  | VARCHAR(255) | SÍ       | NULL    | User agent del navegador                                         |
| `timestamp`  | TIMESTAMP    | NO       | NOW()   | Fecha y hora del evento                                          |
| `severity`   | VARCHAR(20)  | NO       | 'info'  | Nivel: info, warning, error, critical                            |

**Relaciones:**
- `userId` → `users.id` (ManyToOne, ON DELETE SET NULL)

**Índices:**
- Primary Key: `id`
- Index: `type`, `action`, `timestamp`, `userId`
- Index compuesto: (`entityType`, `entityId`)

**Tipos de Log (LogType):**
- `access`: Registros de acceso al condominio
- `visitor`: Eventos relacionados con visitantes
- `vehicle`: Eventos de vehículos
- `incident`: Incidentes reportados
- `system`: Eventos del sistema

**Acciones de Log (LogAction):**
- **Access**: check_in, check_out, access_denied, access_granted
- **Visitor**: visitor_registered, visitor_approved, visitor_rejected, invitation_created, invitation_used, invitation_cancelled
- **Vehicle**: vehicle_registered, vehicle_updated, vehicle_deleted, vehicle_activated
- **Incident**: incident_reported, incident_resolved
- **System**: user_login, user_logout, system_error, config_changed

---

## 🔗 Diagrama de Relaciones

```
users (Single Table Inheritance)
├── RESIDENT
│   ├── visitors (1:N)
│   ├── invitations (1:N)
│   ├── vehicles (1:N)
│   └── frequent_visitors (1:N)
├── ADMIN
└── GUARD

invitations
└── visitor (N:1, opcional)

logs
└── user (N:1, opcional)
```

---

## 📝 Notas Importantes

### Single Table Inheritance
Todos los tipos de usuarios se almacenan en una sola tabla `users` con un campo discriminador `user_type`. Las columnas específicas de cada tipo pueden ser NULL si no aplican.

### Eliminación Lógica
- **vehicles**: Usa `isActive` para eliminación lógica
- **frequent_visitors**: Usa `isActive` para marcar inactivos

### Campos JSONB
Se utilizan campos JSONB para almacenar información flexible:
- `vehicleInfo`: Información de vehículos en visitors/invitations/frequent_visitors
- `details`: Detalles de eventos en logs
- `metadata`: Metadata adicional en logs

### Timestamps Automáticos
- `createdAt`: Se establece automáticamente al crear el registro
- `updatedAt`: Se actualiza automáticamente en cada modificación
- `timestamp`: Se establece al crear logs

### Estados (ENUM)

**VisitorStatus:**
- PENDING: Pendiente de aprobación
- APPROVED: Aprobado
- REJECTED: Rechazado
- IN_PROPERTY: Actualmente en la propiedad
- COMPLETED: Visita completada

**InvitationStatus:**
- PENDING: Pendiente de aprobación
- APPROVED: Aprobada
- REJECTED: Rechazada
- USED: Ya fue utilizada
- EXPIRED: Expirada
- CANCELLED: Cancelada

**VehicleType:**
- SEDAN, SUV, HATCHBACK, PICKUP, VAN, MOTORCYCLE, OTHER

---

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con bcrypt (salt rounds: 10)
- **UUIDs**: Se usan en lugar de IDs incrementales para mayor seguridad
- **Logs**: Todos los eventos críticos se registran para auditoría

---

## 🔄 Migraciones

Actualmente se usa `synchronize: true` en desarrollo. Para producción se recomienda:
1. Desactivar `synchronize`
2. Usar migraciones de TypeORM
3. Versionamiento de cambios de esquema

---

**Última actualización:** 3 de diciembre de 2025  
**Versión del esquema:** 1.0.0
