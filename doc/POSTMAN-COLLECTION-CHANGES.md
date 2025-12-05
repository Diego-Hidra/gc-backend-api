# Cambios en Colección de Postman - Guardian Comunitario API

**Fecha**: 21 de Noviembre de 2025  
**Archivo**: `GC-Backend-API-Complete.postman_collection.json`  
**Objetivo**: Alinear todos los endpoints y ejemplos con `API-ENDPOINTS.md` y `DATABASE-SCHEMA.md`

---

## 📋 Resumen de Cambios

Se actualizaron **7 requests** de la colección de Postman para corregir:
- Nombres de campos según el esquema de base de datos
- Valores de ENUMs según definiciones de PostgreSQL
- URLs de endpoints
- Estructura de bodies para coincidir con DTOs del backend

---

## 🔄 Cambios Detallados por Módulo

### **02. Residents**

#### **02.1 Crear Residente**
**Cambio**: Actualización de nombres de campos en el body

**Antes:**
```json
{
  "rut": "18.765.432-1",
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan.perez@test.com",
  "phone_number": "+56912345678",
  "floor": "D",
  "apartament": "401",
  "password": "Test1234"
}
```

**Después:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "18.765.432-1",
  "email": "juan.perez@test.com",
  "password": "Test1234",
  "phone": "+56912345678",
  "block": "D",
  "lotNumber": "401",
  "role": "resident"
}
```

**Motivo**: Campos coinciden con la entidad `residents` de la base de datos:
- `name` → `firstName`
- `lastname` → `lastName`
- `phone_number` → `phone`
- `floor` → `block`
- `apartament` → `lotNumber`
- Agregado `role` (enum: `resident` | `admin` | `guard`)

---

### **03. Visitors**

#### **03.1 Crear Visitante**
**Cambio 1**: Actualización de nombres de campos

**Antes:**
```json
{
  "rut": "98.765.432-1",
  "name": "María",
  "lastName": "Silva",
  "secondLastName": "Rojas",
  "phone": "+56911223344",
  "licensePlate": "WXYZ-34"
}
```

**Después:**
```json
{
  "firstName": "María",
  "lastName": "Silva",
  "rut": "98.765.432-1",
  "phone": "+56911223344",
  "email": "maria.silva@example.com",
  "visitPurpose": "Visita familiar",
  "hasVehicle": true,
  "vehicleInfo": {
    "licensePlate": "WXYZ-34",
    "brand": "Toyota",
    "model": "Yaris",
    "color": "Blanco"
  }
}
```

**Motivo**: 
- `name` → `firstName`
- Eliminado `secondLastName` (no existe en schema)
- Agregado `email`, `visitPurpose` (requeridos)
- `licensePlate` movido a objeto `vehicleInfo`
- Agregado `hasVehicle` (boolean) y estructura completa de vehículo

**Cambio 2**: Corrección de URL

**Antes:**
```
{{base_url}}/api/{{resident_id}}/visitors/add
```

**Después:**
```
{{base_url}}/api/visitors/{{resident_id}}/add
```

**Motivo**: La ruta correcta según el backend es `/api/visitors/:residentId/add`

---

#### **03.3 Actualizar Estado del Visitante**
**Cambio**: Corrección de valor del enum `status`

**Antes:**
```json
{
  "status": "ACTIVE"
}
```

**Después:**
```json
{
  "status": "APPROVED"
}
```

**Motivo**: El enum `visitor_status` en la base de datos es:
- `PENDING`
- `APPROVED` ✅
- `REJECTED`
- `CHECKED_IN`
- `CHECKED_OUT`

`ACTIVE` no existe en el enum definido.

---

### **05. Frequent Visitors**

#### **05.1 Crear Visitante Frecuente**
**Cambio**: URL corregida

**Antes:**
```
{{base_url}}/api/{{resident_id}}/frequent-visitors/add
```

**Después:**
```
{{base_url}}/api/resident/{{resident_id}}/frequent-visitors
```

**Motivo**: Endpoint correcto según `ResidentController` es `/api/resident/:id/frequent-visitors` (método POST)

---

#### **05.2 Listar Visitantes Frecuentes**
**Cambio**: URL corregida de plural a singular

**Antes:**
```
{{base_url}}/api/residents/{{resident_id}}/frequent-visitors
```

**Después:**
```
{{base_url}}/api/resident/{{resident_id}}/frequent-visitors
```

**Motivo**: El controlador usa `/resident/:id` (singular), no `/residents/:id`

---

### **06. Vehicles**

#### **06.1 Registrar Vehículo**
**Cambio 1**: Actualización del tipo de vehículo

**Antes:**
```json
{
  "licensePlate": "ABCD-12",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "Blanco",
  "type": "SEDAN",
  "notes": "Vehículo del residente"
}
```

**Después:**
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

**Motivo**: 
- Enum `vehicle_type` en la base de datos es: `CAR`, `MOTORCYCLE`, `TRUCK`, `VAN`, `OTHER`
- `SEDAN` no existe ❌ → Cambio a `CAR` ✅
- Campo `notes` no existe en la entidad `Vehicle` (se eliminó)
- Solo existen `deleteReason` y `deleteNotes` para soft delete

---

#### **06.5 Eliminar Vehículo**
**Cambio**: Agregado body con campos opcionales

**Antes:**
```json
(sin body)
```

**Después:**
```json
{
  "reason": "Vehículo vendido",
  "notes": "Compró uno nuevo"
}
```

**Motivo**: El endpoint de eliminación acepta body opcional con:
- `reason` (string): Mapea a `deleteReason` en DB
- `notes` (string): Mapea a `deleteNotes` en DB

Estos campos se usan para auditoría de soft deletes.

---

## ✅ Verificaciones Realizadas

### **ENUMs Corregidos**
- ✅ `VehicleType`: `SEDAN` → `CAR`
- ✅ `VisitorStatus`: `ACTIVE` → `APPROVED`
- ✅ `ResidentRole`: Agregado `role: "resident"`

### **Campos de Base de Datos**
- ✅ `firstName` y `lastName` (en vez de `name`/`lastname`)
- ✅ `block` y `lotNumber` (en vez de `floor`/`apartament`)
- ✅ `phone` (en vez de `phone_number`)
- ✅ `vehicleInfo` como objeto JSON (no solo `licensePlate`)
- ✅ `deleteReason` y `deleteNotes` (eliminado `notes` genérico)

### **URLs de Endpoints**
- ✅ `/api/visitors/:residentId/add` (corregido orden)
- ✅ `/api/resident/:id/frequent-visitors` (singular, no plural)

---

## 📊 Impacto de los Cambios

| Módulo | Requests Modificados | Tipo de Cambio |
|--------|---------------------|----------------|
| Residents | 1 | Campos del body |
| Visitors | 2 | Campos del body + URL |
| Frequent Visitors | 2 | URL |
| Vehicles | 2 | Enum + campos del body |
| **TOTAL** | **7** | - |

---

## 🎯 Próximos Pasos

### **Testing Recomendado**
1. **Probar flujo completo en Postman:**
   - 01.1 Login → Guardar token
   - 02.1 Crear Residente → Guardar `resident_id`
   - 05.1 Crear Visitante Frecuente → Guardar `frequent_visitor_id`
   - 04.1b Crear Invitación con Visitante Frecuente
   - 06.1 Registrar Vehículo → Verificar tipo `CAR`

2. **Validar responses:**
   - Verificar que los campos retornados coincidan con `API-ENDPOINTS.md`
   - Confirmar que los timestamps tienen formato ISO 8601
   - Validar estructura de objetos JSON (`vehicleInfo`, `metadata`)

3. **Casos de error:**
   - Enviar `type: "SEDAN"` en vehículos → Debe fallar con error de validación
   - Enviar `status: "ACTIVE"` en visitantes → Debe fallar
   - Usar campos antiguos (`name`, `lastname`) → Debe fallar

---

## 📝 Notas Importantes

### **Retrocompatibilidad**
⚠️ Estos cambios **rompen** la retrocompatibilidad con versiones anteriores de la colección. Si tienes scripts o automatizaciones que usan:
- `name`/`lastname` en vez de `firstName`/`lastName`
- `floor`/`apartament` en vez de `block`/`lotNumber`
- Enum `SEDAN` en vez de `CAR`
- URLs con `/residents/` (plural) en vez de `/resident/` (singular)

Necesitarás actualizarlos.

### **Validaciones del Backend**
El backend NestJS valida:
- DTOs con decoradores `@IsString()`, `@IsEnum()`, `@IsNotEmpty()`
- Enums de TypeORM deben coincidir con los de PostgreSQL
- Campos requeridos vs opcionales

Si envías campos incorrectos, obtendrás errores `400 Bad Request` con detalles de validación.

### **Consistencia con Documentación**
✅ Ahora los 3 documentos están completamente alineados:
1. **DATABASE-SCHEMA.md** → Estructura de PostgreSQL
2. **API-ENDPOINTS.md** → Documentación de endpoints
3. **GC-Backend-API-Complete.postman_collection.json** → Ejemplos de uso

---

## 🔍 Ejemplo de Flujo Actualizado

### **Crear Residente, Visitante Frecuente e Invitación**

```javascript
// 1. Login
POST /api/auth
Body: { "email": "admin@guardiancomunitario.cl", "password": "admin123" }
→ Guarda access_token

// 2. Crear Residente
POST /api/resident/add
Body: {
  "firstName": "Juan",
  "lastName": "Pérez",
  "rut": "18.765.432-1",
  "email": "juan.perez@test.com",
  "password": "Test1234",
  "phone": "+56912345678",
  "block": "D",
  "lotNumber": "401",
  "role": "resident"
}
→ Guarda resident_id

// 3. Crear Visitante Frecuente
POST /api/resident/{{resident_id}}/frequent-visitors
Body: {
  "name": "Carlos Muñoz",
  "rut": "11.222.333-4",
  "phone": "+56922334455",
  "email": "carlos.munoz@example.com",
  "relationship": "Familiar"
}
→ Guarda frequent_visitor_id

// 4. Crear Invitación con Autocompletado
POST /api/invitations/{{resident_id}}/add
Body: {
  "frequentVisitorId": "{{frequent_visitor_id}}",
  "scheduledDate": "2025-01-25T14:00:00Z",
  "visitPurpose": "Visita familiar"
}
→ Datos del visitante se autocompletan desde el contacto guardado

// 5. Registrar Vehículo
POST /api/{{resident_id}}/cars/add
Body: {
  "licensePlate": "ABCD-12",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "color": "Blanco",
  "type": "CAR"  // ✅ Antes era "SEDAN"
}
```

---

## 📞 Soporte

Si encuentras discrepancias adicionales entre la colección de Postman y el backend:

1. Verificar primero en `DATABASE-SCHEMA.md` la estructura de la tabla
2. Consultar `API-ENDPOINTS.md` para la URL y parámetros correctos
3. Revisar las entidades TypeORM en `/src/entities/`
4. Revisar los DTOs en `/src/dto/`

---

**Última actualización**: 21 de Noviembre de 2025  
**Versión de colección**: Complete (49 endpoints)  
**Estado**: ✅ Alineado con base de datos y documentación
