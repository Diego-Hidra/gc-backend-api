# 📘 Guía de Uso - Colección Postman Guardian Comunitario API

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Variables de Entorno](#variables-de-entorno)
4. [Orden de Ejecución Recomendado](#orden-de-ejecución-recomendado)
5. [Módulos y Endpoints](#módulos-y-endpoints)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### 1. Software Necesario
- ✅ **Postman Desktop** (versión 10.0 o superior)
- ✅ **PostgreSQL** (versión 14 o superior)
- ✅ **Node.js** (versión 18 o superior)
- ✅ **NestJS CLI** instalado globalmente

### 2. Backend Corriendo
```bash
cd Backend/gc-backend-api
npm install
npm run start:dev
```

El servidor debe estar corriendo en: `http://localhost:3000`

### 3. Base de Datos Configurada
Ejecutar el script SQL incluido: `database-setup.sql`

---

## ⚙️ Configuración Inicial

### Paso 1: Importar la Colección
1. Abrir Postman
2. Click en **Import**
3. Seleccionar `GC-Backend-API-Complete.postman_collection.json`
4. La colección aparecerá en el panel izquierdo

### Paso 2: Importar Environment
1. Click en **Environments** (⚙️ arriba a la derecha)
2. Click en **Import**
3. Seleccionar `GC-Backend-API.postman_environment.json`
4. Seleccionar el environment **GC Backend API - Development**

### Paso 3: Verificar Variables
En el environment, verificar que existan:
- `base_url`: `http://localhost:3000`
- `access_token`: (se llenará automáticamente al hacer login)
- `resident_id`: (se llenará automáticamente)
- `visitor_id`: (se llenará automáticamente)
- `invitation_id`: (se llenará automáticamente)
- `vehicle_id`: (se llenará automáticamente)

---

## 🔑 Variables de Entorno

### Variables Principales

| Variable | Descripción | Valor por Defecto | Auto-generada |
|----------|-------------|-------------------|---------------|
| `base_url` | URL base del API | `http://localhost:3000` | ❌ |
| `access_token` | JWT token | - | ✅ (al hacer login) |
| `resident_id` | ID del residente | - | ✅ |
| `visitor_id` | ID del visitante | - | ✅ |
| `invitation_id` | ID de invitación | - | ✅ |
| `vehicle_id` | ID del vehículo | - | ✅ |
| `frequent_visitor_id` | ID visitante frecuente | - | ✅ |
| `log_id` | ID del log | - | ✅ |
| `qr_code` | Código QR | - | ✅ |

### Variables Opcionales para Testing

| Variable | Descripción | Valor de Ejemplo |
|----------|-------------|------------------|
| `test_rut` | RUT de prueba | `12.345.678-9` |
| `test_email` | Email de prueba | `test@example.com` |
| `test_password` | Password de prueba | `password123` |
| `test_plate` | Patente de prueba | `ABCD-12` |

---

## 🚀 Orden de Ejecución Recomendado

### Para Testing Inicial (Primera Vez)

#### 1️⃣ Autenticación
```
01. Auth > Login
```
✅ Esto guarda automáticamente el `access_token`

#### 2️⃣ Crear Residente
```
02. Residents > Crear Residente
```
✅ Guarda el `resident_id` automáticamente

#### 3️⃣ Crear Visitante
```
03. Residents > Visitantes > Crear Visitante
```
✅ Guarda el `visitor_id`

#### 4️⃣ Crear Invitación
```
04. Invitations > Crear Invitación
```
✅ Guarda el `invitation_id` y `qr_code`

#### 5️⃣ Aprobar Invitación
```
05. Invitations > Aprobar Invitación
```
✅ Genera QR code automáticamente

#### 6️⃣ Escanear QR (Check-in)
```
06. QR Codes > Check-in
```
✅ Registra entrada del visitante

#### 7️⃣ Escanear QR (Check-out)
```
07. QR Codes > Check-out
```
✅ Registra salida del visitante

---

## 📚 Módulos y Endpoints

### 🔐 Módulo 1: Auth (1 endpoint)

#### 1.1 Login
- **Método:** POST
- **URL:** `/api/auth`
- **Auth:** No requiere
- **Body:**
```json
{
  "email": "residente@example.com",
  "password": "password123"
}
```
- **Response:** JWT token (se guarda automáticamente)

---

### 👥 Módulo 2: Residents (14 endpoints)

#### 2.1 Crear Residente
- **Método:** POST
- **URL:** `/api/resident/add`
- **Body:**
```json
{
  "email": "juan.perez@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "12.345.678-9",
  "phone": "+56912345678",
  "block": "A",
  "lotNumber": "101"
}
```

#### 2.2 Listar Todos los Residentes
- **Método:** GET
- **URL:** `/api/resident/all?page=1&limit=10`

#### 2.3 Obtener Residente por ID
- **Método:** GET
- **URL:** `/api/resident/:id`

#### 2.4 Actualizar Residente
- **Método:** PATCH
- **URL:** `/api/resident/:id`

#### 2.5 Eliminar Residente
- **Método:** DELETE
- **URL:** `/api/resident/:id`

#### 2.6 - 2.14 Visitantes (ver sección Visitantes)

---

### 👋 Módulo 3: Visitantes (3 endpoints dentro de Residents)

#### 3.1 Crear Visitante
- **Método:** POST
- **URL:** `/api/:id_resident/visitors/add`
- **Body:**
```json
{
  "firstName": "María",
  "lastName": "González",
  "rut": "98.765.432-1",
  "phone": "+56987654321",
  "email": "maria.gonzalez@example.com",
  "scheduledDate": "2025-11-25T10:00:00Z",
  "visitPurpose": "Visita familiar",
  "hasVehicle": true,
  "vehicleInfo": {
    "plate": "WXYZ-99",
    "brand": "Toyota",
    "model": "Corolla",
    "color": "Blanco"
  }
}
```

#### 3.2 Listar Visitantes
- **Método:** GET
- **URL:** `/api/visitors/all?page=1&limit=10&status=PENDING`
- **Query Params:**
  - `status`: PENDING, APPROVED, REJECTED, IN_PROPERTY, COMPLETED
  - `residentId`: Filtrar por residente
  - `startDate`: Fecha inicio
  - `endDate`: Fecha fin

#### 3.3 Actualizar Estado del Visitante
- **Método:** PATCH
- **URL:** `/api/visitors/:id/status`
- **Body:**
```json
{
  "status": "APPROVED",
  "rejectionReason": ""
}
```

---

### 📨 Módulo 4: Invitations (6 endpoints)

#### 4.1 Crear Invitación
- **Método:** POST
- **URL:** `/api/:id_resident/invitations/add`
- **Body:**
```json
{
  "visitorName": "Carlos Ruiz",
  "visitorRut": "11.222.333-4",
  "scheduledDate": "2025-11-25T14:00:00Z",
  "expirationDate": "2025-11-25T23:59:59Z",
  "visitPurpose": "Entrega de paquete",
  "visitorId": "{{visitor_id}}"
}
```

#### 4.2 Listar Invitaciones
- **Método:** GET
- **URL:** `/api/invitations/all?page=1&limit=10`

#### 4.3 Obtener Invitación por ID
- **Método:** GET
- **URL:** `/api/invitations/:id`

#### 4.4 Aprobar Invitación
- **Método:** PATCH
- **URL:** `/api/invitations/:id/approve`
- **Resultado:** Genera QR code automáticamente

#### 4.5 Rechazar Invitación
- **Método:** PATCH
- **URL:** `/api/invitations/:id/reject`
- **Body:**
```json
{
  "rejectionReason": "Fecha no disponible"
}
```

#### 4.6 Cancelar Invitación
- **Método:** PATCH
- **URL:** `/api/invitations/:id/cancel`
- **Body:**
```json
{
  "cancellationReason": "Visita pospuesta"
}
```

---

### 👨‍👩‍👧‍👦 Módulo 5: Frequent Visitors (4 endpoints)

#### 5.1 Crear Visitante Frecuente
- **Método:** POST
- **URL:** `/api/:id_resident/frequent-visitors/add`
- **Body:**
```json
{
  "name": "Pedro Martínez",
  "rut": "55.666.777-8",
  "phone": "+56955666777",
  "relationship": "Hermano",
  "vehicleInfo": {
    "plate": "PQRS-44",
    "brand": "Chevrolet",
    "model": "Spark"
  }
}
```

#### 5.2 Listar Visitantes Frecuentes
- **Método:** GET
- **URL:** `/api/residents/:id/frequent-visitors?page=1&limit=10`

#### 5.3 Crear Invitación desde Visitante Frecuente
- **Método:** POST
- **URL:** `/api/frequent-visitors/:id/create-invitation`
- **Body:**
```json
{
  "scheduledDate": "2025-11-26T10:00:00Z",
  "expirationDate": "2025-11-26T23:59:59Z",
  "visitPurpose": "Visita familiar"
}
```

#### 5.4 Eliminar Visitante Frecuente
- **Método:** DELETE
- **URL:** `/api/frequent-visitors/:id`
- **Body:**
```json
{
  "reason": "Ya no viene regularmente"
}
```

---

### 🚗 Módulo 6: Vehicles (9 endpoints)

#### 6.1 Registrar Vehículo
- **Método:** POST
- **URL:** `/api/:id_resident/cars/add`
- **Body:**
```json
{
  "licensePlate": "ABCD-12",
  "brand": "Mazda",
  "model": "CX-5",
  "year": 2023,
  "color": "Rojo",
  "type": "SUV"
}
```
- **Tipos válidos:** SEDAN, SUV, HATCHBACK, PICKUP, VAN, MOTORCYCLE, OTHER

#### 6.2 Listar Todos los Vehículos
- **Método:** GET
- **URL:** `/api/cars/all?page=1&limit=10&type=SUV&isActive=true`

#### 6.3 Obtener Vehículo por ID
- **Método:** GET
- **URL:** `/api/cars/:id_car`

#### 6.4 Actualizar Vehículo
- **Método:** PATCH
- **URL:** `/api/cars/:id/update`
- **Body:**
```json
{
  "color": "Azul",
  "year": 2024
}
```

#### 6.5 Eliminar Vehículo (Soft Delete)
- **Método:** PATCH
- **URL:** `/api/cars/car/:id/delete`
- **Body:**
```json
{
  "reason": "Vehículo vendido",
  "notes": "Reemplazado por uno nuevo"
}
```

#### 6.6 Buscar Vehículo por Patente
- **Método:** GET
- **URL:** `/api/cars/search?plate=ABCD-12`

#### 6.7 Verificar Patente Duplicada
- **Método:** GET
- **URL:** `/api/cars/check-duplicate?plate=ABCD-12&excludeId={{vehicle_id}}`

#### 6.8 Estadísticas de Vehículos
- **Método:** GET
- **URL:** `/api/residents/:id/vehicles/stats`

#### 6.9 Reactivar Vehículo
- **Método:** PATCH
- **URL:** `/api/cars/:id/activate`

---

### 📋 Módulo 7: Logs (9 endpoints)

#### 7.1 Crear Log Manual
- **Método:** POST
- **URL:** `/api/logs/create`
- **Body:**
```json
{
  "type": "access",
  "action": "check_in",
  "description": "Residente ingresó a la comunidad",
  "userId": "{{resident_id}}",
  "severity": "info"
}
```
- **Tipos:** access, visitor, vehicle, incident, system
- **Severidad:** info, warning, error, critical

#### 7.2 Logs del Día por Tipo
- **Método:** GET
- **URL:** `/api/logs/per_day/:log_type`
- **Ejemplo:** `/api/logs/per_day/access`

#### 7.3 Todos los Logs por Tipo (con filtros)
- **Método:** GET
- **URL:** `/api/logs/all/:log_type?page=1&limit=50&severity=error`

#### 7.4 Todos los Logs (sin filtro de tipo)
- **Método:** GET
- **URL:** `/api/logs/all?page=1&limit=50`

#### 7.5 Obtener Log por ID
- **Método:** GET
- **URL:** `/api/logs/:id`

#### 7.6 Logs por Usuario
- **Método:** GET
- **URL:** `/api/logs/user/:userId?page=1&limit=50`

#### 7.7 Logs por Entidad
- **Método:** GET
- **URL:** `/api/logs/entity/:entityType/:entityId`
- **Ejemplo:** `/api/logs/entity/visitor/{{visitor_id}}`

#### 7.8 Estadísticas de Logs
- **Método:** GET
- **URL:** `/api/logs/stats?startDate=2025-11-01&endDate=2025-11-30`

#### 7.9 Limpiar Logs Antiguos
- **Método:** POST
- **URL:** `/api/logs/clean?daysToKeep=90`

---

### 🔲 Módulo 8: QR Codes (3 endpoints)

#### 8.1 Validar QR
- **Método:** POST
- **URL:** `/api/qr/validate`
- **Body:**
```json
{
  "qrCode": "{{qr_code}}"
}
```
- **Uso:** Verificar QR sin registrar entrada/salida

#### 8.2 Check-in (Escanear QR de Entrada)
- **Método:** POST
- **URL:** `/api/qr/check-in`
- **Body:**
```json
{
  "qrCode": "{{qr_code}}",
  "guardId": "guard-001",
  "gateLocation": "Puerta Principal",
  "additionalData": {
    "temperature": "36.5",
    "notes": "Todo en orden"
  }
}
```
- **Uso:** Registrar entrada de residente o visitante

#### 8.3 Check-out (Escanear QR de Salida)
- **Método:** POST
- **URL:** `/api/qr/check-out`
- **Body:**
```json
{
  "qrCode": "{{qr_code}}",
  "guardId": "guard-001",
  "gateLocation": "Puerta Principal",
  "additionalData": {
    "notes": "Salida normal"
  }
}
```
- **Uso:** Registrar salida y calcular duración de visita

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Visitante

```
1. Login (Auth > Login)
   → Obtiene access_token

2. Crear Residente (Residents > Crear Residente)
   → Guarda resident_id

3. Crear Visitante (Residents > Visitantes > Crear Visitante)
   → Guarda visitor_id

4. Crear Invitación (Invitations > Crear Invitación)
   → Guarda invitation_id

5. Aprobar Invitación (Invitations > Aprobar Invitación)
   → Genera qr_code

6. Validar QR (QR Codes > Validar QR)
   → Verifica que el QR es válido

7. Check-in (QR Codes > Check-in)
   → Registra entrada del visitante

8. Check-out (QR Codes > Check-out)
   → Registra salida y calcula duración
```

### Ejemplo 2: Gestión de Vehículos

```
1. Login
2. Registrar Vehículo (Vehicles > Registrar Vehículo)
3. Listar Vehículos (Vehicles > Listar Todos)
4. Verificar Duplicado (Vehicles > Verificar Patente)
5. Obtener Estadísticas (Vehicles > Estadísticas)
```

### Ejemplo 3: Visitante Frecuente

```
1. Login
2. Crear Visitante Frecuente (Frequent Visitors > Crear)
3. Listar Visitantes Frecuentes (Frequent Visitors > Listar)
4. Crear Invitación desde Frecuente (Frequent Visitors > Crear Invitación)
5. Aprobar Invitación
6. Check-in con QR
```

---

## 🔍 Troubleshooting

### Error: "401 Unauthorized"
**Causa:** Token JWT expirado o inválido
**Solución:**
1. Ejecutar nuevamente `Auth > Login`
2. Verificar que el token se guardó en `{{access_token}}`
3. Verificar que el environment está seleccionado

### Error: "404 Not Found"
**Causa:** URL incorrecta o servidor no corriendo
**Solución:**
1. Verificar que el backend está corriendo: `npm run start:dev`
2. Verificar `base_url` en environment: `http://localhost:3000`
3. No incluir `/` al final de `base_url`

### Error: "400 Bad Request - Validation failed"
**Causa:** Datos en el body no cumplen validaciones
**Solución:**
1. Verificar formato de RUT: `12.345.678-9`
2. Verificar formato de patente: `ABCD-12` (4 letras + guion + 2 números)
3. Verificar formato de teléfono: `+56912345678`
4. Verificar formato de email: `user@example.com`
5. Verificar que año de vehículo esté entre 1900 y 2025

### Error: "QR Code inválido"
**Causa:** QR code no generado o corrupto
**Solución:**
1. Ejecutar `Invitations > Aprobar Invitación` para generar QR
2. El QR se guarda automáticamente en `{{qr_code}}`
3. Copiar el QR desde la respuesta si no se guardó automáticamente

### Variables no se guardan automáticamente
**Solución:**
1. Verificar que los **Tests** están habilitados en cada request
2. Abrir el request → Tab **Tests**
3. Verificar que existe el script de guardado de variables
4. Ejemplo:
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("resident_id", jsonData.data.id);
}
```

### Base de datos no conecta
**Solución:**
1. Verificar PostgreSQL corriendo: `pg_isready`
2. Verificar credenciales en `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DATABASE=guardian_comunitario
```
3. Crear base de datos si no existe:
```sql
CREATE DATABASE guardian_comunitario;
```

---

## 📊 Tests Automáticos

Cada request incluye tests automáticos que:
- ✅ Verifican el código de status
- ✅ Guardan variables en el environment
- ✅ Validan la estructura de la respuesta

Para ejecutar todos los tests:
1. Click derecho en la colección
2. Seleccionar **Run collection**
3. Configurar orden de ejecución
4. Click en **Run GC Backend API**

---

## 🎯 Mejores Prácticas

### 1. Orden de Ejecución
Siempre ejecutar en orden:
1. Auth (Login)
2. Crear entidades padre (Resident)
3. Crear entidades hijas (Visitor, Vehicle, etc.)

### 2. Limpiar Variables
Si necesitas empezar de cero:
```javascript
// En Postman Console
pm.environment.unset("resident_id");
pm.environment.unset("visitor_id");
pm.environment.unset("invitation_id");
```

### 3. Backup de Variables
Guardar los IDs importantes en un archivo:
```
resident_id: abc-123-def
visitor_id: xyz-456-uvw
invitation_id: qrs-789-tuv
```

### 4. Múltiples Environments
Crear environments separados para:
- Development (`http://localhost:3000`)
- Staging (`http://staging.example.com`)
- Production (`http://api.example.com`)

---

## 📞 Soporte

Para problemas o dudas:
- **Backend Issues:** Revisar logs en consola de NestJS
- **Database Issues:** Revisar logs de PostgreSQL
- **Postman Issues:** Ver Postman Console (View > Show Postman Console)

---

## 🎉 ¡Listo para Usar!

Con esta guía deberías poder:
- ✅ Configurar Postman correctamente
- ✅ Ejecutar todos los 46 endpoints
- ✅ Entender el flujo de cada módulo
- ✅ Resolver problemas comunes

**¡Buena suerte con las pruebas! 🚀**
