# Endpoints Disponibles - Guardian Comunitario API

> **Base URL**: `http://localhost:3000` (desarrollo) | `http://192.168.1.92:3000` (móvil)  
> **Autenticación**: JWT Token (Bearer) en todos los endpoints excepto `/api/auth`  
> **Última actualización**: 4 de diciembre de 2025

---

## 🔐 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth` | Login de usuario (devuelve JWT token) | ❌ No |

**Ejemplo Login**:
```json
POST /api/auth
Body: {
  "email": "test.resident@guardian.com",
  "password": "Password123!"
}
Response: {
  "success": true,
  "data": {
    "access_token": "eyJhbGc..."
  }
}
```

---

## 👤 Residentes

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `POST` | `/api/resident/add` | Crear nuevo residente | ✅ Sí | ADMIN |
| `GET` | `/api/resident/all` | Listar todos los residentes | ✅ Sí | ADMIN |
| `GET` | `/api/resident/:id` | Obtener residente por ID | ✅ Sí | Cualquiera |
| `PATCH` | `/api/resident/:id/update` | Actualizar residente (admin) | ✅ Sí | ADMIN |
| `PATCH` | `/api/resident/:id/profile` | Actualizar propio perfil | ✅ Sí | Cualquiera |

---

## 👥 Visitantes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/visitors/all` | Listar todos los visitantes | ✅ Sí |
| `POST` | `/api/visitors/:residentId/add` | Crear visitante para residente | ✅ Sí |
| `PATCH` | `/api/visitors/:id/status` | Actualizar estado del visitante | ✅ Sí |

---

## 📨 Invitaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/invitations/all` | Listar todas las invitaciones | ✅ Sí |
| `GET` | `/api/invitations/resident/:residentId` | Invitaciones de un residente | ✅ Sí |
| `GET` | `/api/invitations/:id` | Obtener invitación por ID | ✅ Sí |
| `POST` | `/api/invitations/:residentId/add` | Crear invitación | ✅ Sí |
| `PATCH` | `/api/invitations/:id/approve` | Aprobar invitación | ✅ Sí |
| `PATCH` | `/api/invitations/:id/reject` | Rechazar invitación | ✅ Sí |
| `PATCH` | `/api/invitations/:id/cancel` | Cancelar invitación | ✅ Sí |
| `PATCH` | `/api/invitations/:id/status` | Actualizar estado | ✅ Sí |

---

## 🚗 Vehículos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cars/all` | Listar vehículos (con filtros) | ✅ Sí |
| `GET` | `/api/cars/search?licensePlate=XXX` | Buscar por patente | ✅ Sí |
| `GET` | `/api/cars/check-duplicate?licensePlate=XXX` | Verificar duplicado | ✅ Sí |
| `GET` | `/api/cars/:id_car` | Obtener vehículo por ID | ✅ Sí |
| `GET` | `/api/residents/:id/vehicles/stats` | Estadísticas de vehículos | ✅ Sí |
| `POST` | `/api/:id_resident/cars/add` | Registrar vehículo | ✅ Sí |
| `PATCH` | `/api/cars/:id/update` | Actualizar vehículo | ✅ Sí |
| `PATCH` | `/api/cars/:id/activate` | Activar/desactivar vehículo | ✅ Sí |
| `PATCH` | `/api/cars/car/:id/delete` | Eliminar vehículo (soft delete) | ✅ Sí |

**Parámetros de búsqueda** (`/api/cars/all`):
- `page`: número de página (default: 1)
- `limit`: items por página (default: 50, max: 200)
- `ownerId`: filtrar por propietario
- `type`: filtrar por tipo (SEDAN, SUV, etc.)
- `isActive`: true/false
- `search`: búsqueda por patente, marca o modelo

---

## 👨‍👩‍👧‍👦 Visitantes Frecuentes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/frequent-visitors/:id/create-invitation` | Crear invitación desde frecuente | ✅ Sí |
| `DELETE` | `/api/frequent-visitors/:id` | Eliminar visitante frecuente | ✅ Sí |

---

## 📱 QR / Acceso

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/access/resident/qr` | Generar código QR para residente | ✅ Sí |

**Response**: Imagen PNG en base64

---

## 📝 Logs

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/logs/all` | Listar todos los logs (paginado) | ✅ Sí |
| `GET` | `/api/logs/all/:log_type` | Logs por tipo con filtros | ✅ Sí |
| `GET` | `/api/logs/per_day/:log_type` | Logs del día por tipo | ✅ Sí |
| `GET` | `/api/logs/:id` | Obtener log por ID | ✅ Sí |
| `GET` | `/api/logs/user/:userId` | Logs de un usuario | ✅ Sí |
| `GET` | `/api/logs/entity/:entityType/:entityId` | Logs de una entidad | ✅ Sí |
| `GET` | `/api/logs/stats` | Estadísticas de logs | ✅ Sí |
| `POST` | `/api/logs/create` | Crear nuevo log | ✅ Sí |
| `POST` | `/api/logs/clean` | Limpiar logs antiguos | ✅ Sí |

**Tipos de log**: `access`, `visitor`, `vehicle`, `invitation`, `system`

---

## 📊 Resumen de Endpoints

| Módulo | Total Endpoints | Públicos | Protegidos |
|--------|----------------|----------|------------|
| **Autenticación** | 1 | 1 | 0 |
| **Residentes** | 5 | 0 | 5 |
| **Visitantes** | 3 | 0 | 3 |
| **Invitaciones** | 8 | 0 | 8 |
| **Vehículos** | 9 | 0 | 9 |
| **Visitantes Frecuentes** | 2 | 0 | 2 |
| **QR/Acceso** | 1 | 0 | 1 |
| **Logs** | 9 | 0 | 9 |
| **TOTAL** | **38** | **1** | **37** |

---

## 🔑 Autenticación JWT

### Headers Requeridos
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Payload del Token
```json
{
  "sub": "afela277-1ef8-4229-a908-64b027c7101c",
  "email": "test.resident@guardian.com",
  "user_type": "RESIDENT",
  "name": "Test",
  "floor": "5",
  "apartament": "501",
  "iat": 1733349600,
  "exp": 1733436000
}
```

---

## 📝 Formato de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa" // opcional
}
```

### Respuesta con Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["Detalle 1", "Detalle 2"]
}
```

### Respuesta Paginada
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2,
    "currentPage": 1,
    "itemsPerPage": 50,
    "totalItems": 100
  }
}
```

---

## 🚀 Pruebas Rápidas

### Con cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test.resident@guardian.com","password":"Password123!"}'

# Obtener visitantes (con token)
curl -X GET http://localhost:3000/api/visitors/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Con Postman
1. Importar colección: `GC-Backend-API.postman_collection.json`
2. Configurar variable de entorno `{{baseUrl}}` = `http://localhost:3000`
3. Hacer login para obtener token
4. El token se guarda automáticamente en las variables de entorno

---

## 🔒 Niveles de Acceso

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador del sistema | Acceso total, crear residentes, actualizar cualquier usuario |
| **GUARD** | Guardia de seguridad | Gestionar accesos, aprobar invitaciones, ver logs |
| **RESIDENT** | Residente | Crear invitaciones, gestionar vehículos, actualizar propio perfil |

---

**Notas**:
- Todos los endpoints (excepto `/api/auth`) requieren token JWT válido
- Los tokens expiran en 24 horas (configurable en `.env`)
- Algunos endpoints requieren rol específico (ver columna "Rol")
- Los IDs son UUIDs en formato: `afela277-1ef8-4229-a908-64b027c7101c`

**Credenciales de Prueba**:
```
Email: test.resident@guardian.com
Password: Password123!
Tipo: RESIDENT
```
