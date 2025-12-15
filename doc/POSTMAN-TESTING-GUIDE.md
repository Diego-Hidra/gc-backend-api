# Guardian Comunitario - Postman Testing Guide

## 🧪 Test Data in Database

Based on current database records:

| ID | RUT | Email | Name | Block | Lot |
|----|-----|-------|------|-------|-----|
| `717d10e3-4c40-4cfe-97a8-45d22257ff20` | `12.345.678-9` | admin@guardiancomunitario.cl | Admin Sistema | A | 101 |
| `199c7e72-0627-456d-9c9c-c6d1cc261748` | `15.245.234-5` | Carman@guardiancomunitario.cl | Jose Carman | B | 201 |
| `e09e94c9-5ec4-4113-afb9-b6c6940d51fc` | `20.085.133-1` | visitormen@guardiancomunitario.cl | Carlos Visitormen | C | 601 |

---

## 🔧 Postman Environment Variables

Create a Postman Environment with these variables:

```json
{
  "base_url": "http://localhost:3000",
  "token": "",
  "resident_id": "717d10e3-4c40-4cfe-97a8-45d22257ff20",
  "test_rut": "12.345.678-9",
  "test_email": "admin@guardiancomunitario.cl"
}
```

---

## 📝 API Endpoint Tests

### 1. Authentication

#### 1.1 Login (POST /api/auth)
```json
POST {{base_url}}/api/auth
Content-Type: application/json

{
  "email": "admin@guardiancomunitario.cl",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "717d10e3-4c40-4cfe-97a8-45d22257ff20",
    "email": "admin@guardiancomunitario.cl",
    "firstName": "Admin",
    "lastName": "Sistema",
    "role": "resident"
  }
}
```

**Post-Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.environment.set("token", response.access_token);
    pm.environment.set("resident_id", response.user.id);
});
```

---

### 2. Residents

#### 2.1 Create Resident (POST /api/resident/add)
```json
POST {{base_url}}/api/resident/add
Content-Type: application/json

{
  "name": "Test",
  "lastname": "User",
  "email": "test.user@test.com",
  "rut": "19.876.543-2",
  "phone_number": "+56999888777",
  "floor": "D",
  "apartament": "404",
  "password": "Test1234"
}
```

**Note:** 
- `name` maps to `firstName`
- `lastname` maps to `lastName`  
- `phone_number` maps to `phone`
- `floor` maps to `block`
- `apartament` maps to `lotNumber`

#### 2.2 Get All Residents (GET /api/resident/all)
```
GET {{base_url}}/api/resident/all
```

#### 2.3 Get Resident by ID (GET /api/resident/:id)
```
GET {{base_url}}/api/resident/{{resident_id}}
```

#### 2.4 Update Resident (PATCH /api/resident/:id)
```json
PATCH {{base_url}}/api/resident/{{resident_id}}
Content-Type: application/json

{
  "phone": "+56988776655",
  "block": "A",
  "lotNumber": "105"
}
```

#### 2.5 Delete Resident (DELETE /api/resident/:id)
```
DELETE {{base_url}}/api/resident/{{resident_id}}
```
**Note:** This is a soft delete (sets `isActive = false`)

#### 2.6 Search Resident by RUT (GET /api/resident/search)
```
GET {{base_url}}/api/resident/search?rut=12.345.678-9
```

**Working RUTs:**
- `12.345.678-9`
- `15.245.234-5`
- `20.085.133-1`

#### 2.7 Search Resident by Email (GET /api/resident/search)
```
GET {{base_url}}/api/resident/search?email=admin@guardiancomunitario.cl
```

**Working Emails:**
- `admin@guardiancomunitario.cl`
- `Carman@guardiancomunitario.cl`
- `visitormen@guardiancomunitario.cl`

#### 2.8 Get Resident Visitors (GET /api/resident/:id/visitors)
```
GET {{base_url}}/api/resident/{{resident_id}}/visitors
```
**Status:** Returns empty array (stub)

#### 2.9 Get Resident Invitations (GET /api/resident/:id/invitations)
```
GET {{base_url}}/api/resident/{{resident_id}}/invitations
```
**Status:** Returns empty array (stub)

#### 2.10 Get Resident Vehicles (GET /api/resident/:id/vehicles)
```
GET {{base_url}}/api/resident/{{resident_id}}/vehicles
```
**Status:** Returns empty array (stub)

#### 2.11 Change Password (PATCH /api/resident/:id/change-password)
```json
PATCH {{base_url}}/api/resident/{{resident_id}}/change-password
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "NewPass1234"
}
```

#### 2.12 Check Email Availability (GET /api/resident/check-email)
```
GET {{base_url}}/api/resident/check-email?email=newemail@test.com
```

**Expected Response:**
```json
{
  "available": true
}
```

#### 2.13 Check RUT Availability (GET /api/resident/check-rut)
```
GET {{base_url}}/api/resident/check-rut?rut=99.999.999-9
```

**Expected Response:**
```json
{
  "available": true
}
```

#### 2.14 Get Resident Stats (GET /api/resident/:id/stats)
```
GET {{base_url}}/api/resident/{{resident_id}}/stats
```

**Expected Response:**
```json
{
  "totalVisitors": 0,
  "totalInvitations": 0,
  "totalVehicles": 0
}
```

---

### 3. Visitors

#### 3.1 Get All Visitors (GET /api/visitors/all)
```
GET {{base_url}}/api/visitors/all
```

#### 3.2 Update Visitor Status (PATCH /api/visitors/:id/status)
```json
PATCH {{base_url}}/api/visitors/{{visitor_id}}/status
Content-Type: application/json

{
  "status": "APPROVED"
}
```

**Valid Statuses:** `PENDING`, `APPROVED`, `REJECTED`, `CHECKED_IN`, `CHECKED_OUT`

---

### 4. Invitations

#### 4.1 Create Invitation from Resident (POST /api/resident/:id/invitations)
```json
POST {{base_url}}/api/resident/{{resident_id}}/invitations
Content-Type: application/json

{
  "visitorName": "Juan Pérez",
  "visitorRut": "16.789.012-3",
  "scheduledDate": "2025-11-25T15:00:00",
  "visitPurpose": "Visita social",
  "notes": "Favor autorizar ingreso"
}
```
**Status:** Stub - Returns "Endpoint en desarrollo"

#### 4.2 Get All Invitations (GET /api/invitations/all)
```
GET {{base_url}}/api/invitations/all
```

#### 4.3 Get Invitation by ID (GET /api/invitations/:id)
```
GET {{base_url}}/api/invitations/{{invitation_id}}
```

#### 4.4 Approve Invitation (PATCH /api/invitations/:id/approve)
```
PATCH {{base_url}}/api/invitations/{{invitation_id}}/approve
```

#### 4.5 Reject Invitation (PATCH /api/invitations/:id/reject)
```json
PATCH {{base_url}}/api/invitations/{{invitation_id}}/reject
Content-Type: application/json

{
  "reason": "Fecha no disponible"
}
```

#### 4.6 Cancel Invitation (PATCH /api/invitations/:id/cancel)
```json
PATCH {{base_url}}/api/invitations/{{invitation_id}}/cancel
Content-Type: application/json

{
  "reason": "Cambio de planes"
}
```

#### 4.7 Update Invitation Status (PATCH /api/invitations/:id/status)
```json
PATCH {{base_url}}/api/invitations/{{invitation_id}}/status
Content-Type: application/json

{
  "status": "USED"
}
```

---

### 5. Frequent Visitors

#### 5.1 Create Frequent Visitor (POST /api/resident/:id/frequent-visitors)
```json
POST {{base_url}}/api/resident/{{resident_id}}/frequent-visitors
Content-Type: application/json

{
  "name": "Ana López",
  "rut": "17.654.321-0",
  "phone": "+56977665544",
  "relationship": "Empleada doméstica",
  "notes": "Viene todos los lunes y jueves"
}
```
**Status:** Stub - Returns "Endpoint en desarrollo"

#### 5.2 Get Frequent Visitors (GET /api/resident/:id/frequent-visitors)
```
GET {{base_url}}/api/resident/{{resident_id}}/frequent-visitors
```
**Status:** Returns empty array (stub)

#### 5.3 Create Invitation from Frequent Visitor (POST /api/frequent-visitors/:id/create-invitation)
```json
POST {{base_url}}/api/frequent-visitors/{{frequent_visitor_id}}/create-invitation
Content-Type: application/json

{
  "scheduledDate": "2025-11-22T10:00:00",
  "visitPurpose": "Trabajo doméstico"
}
```

#### 5.4 Delete Frequent Visitor (DELETE /api/frequent-visitors/:id)
```
DELETE {{base_url}}/api/frequent-visitors/{{frequent_visitor_id}}
```

---

### 6. Vehicles

#### 6.1 Add Vehicle (POST /api/:id_resident/cars/add)
```json
POST {{base_url}}/{{resident_id}}/cars/add
Content-Type: application/json

{
  "licensePlate": "ABCD12",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2022,
  "color": "Gris",
  "type": "CAR"
}
```

**Valid Types:** `CAR`, `MOTORCYCLE`, `TRUCK`, `VAN`, `OTHER`

#### 6.2 Get All Vehicles (GET /api/cars/all)
```
GET {{base_url}}/api/cars/all
```

#### 6.3 Get Vehicle by ID (GET /api/cars/:id_car)
```
GET {{base_url}}/api/cars/{{vehicle_id}}
```

#### 6.4 Update Vehicle (PATCH /api/cars/:id/update)
```json
PATCH {{base_url}}/api/cars/{{vehicle_id}}/update
Content-Type: application/json

{
  "color": "Azul",
  "year": 2023
}
```

#### 6.5 Delete Vehicle (PATCH /api/cars/car/:id/delete)
```json
PATCH {{base_url}}/api/cars/car/{{vehicle_id}}/delete
Content-Type: application/json

{
  "reason": "Vehículo vendido",
  "notes": "Ya no pertenece al residente"
}
```

#### 6.6 Search Vehicles (GET /api/cars/search)
```
GET {{base_url}}/api/cars/search?query=Toyota
```

#### 6.7 Check Duplicate License Plate (GET /api/cars/check-duplicate)
```
GET {{base_url}}/api/cars/check-duplicate?licensePlate=ABCD12
```

#### 6.8 Get Vehicle Stats (GET /api/residents/:id/vehicles/stats)
```
GET {{base_url}}/api/residents/{{resident_id}}/vehicles/stats
```

#### 6.9 Activate Vehicle (PATCH /api/cars/:id/activate)
```
PATCH {{base_url}}/api/cars/{{vehicle_id}}/activate
```

---

### 7. Logs

#### 7.1 Create Log (POST /api/logs/create)
```json
POST {{base_url}}/api/logs/create
Content-Type: application/json

{
  "type": "USER",
  "action": "LOGIN",
  "description": "Usuario inició sesión",
  "userId": "{{resident_id}}",
  "entityType": "resident",
  "entityId": "{{resident_id}}",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

**Valid Types:** `SYSTEM`, `USER`, `VISITOR`, `SECURITY`, `ERROR`  
**Valid Actions:** `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `ACCESS_GRANTED`, `ACCESS_DENIED`

#### 7.2 Get Logs Per Day (GET /api/logs/per_day/:log_type)
```
GET {{base_url}}/api/logs/per_day/USER
```

#### 7.3 Get Logs by Type (GET /api/logs/all/:log_type)
```
GET {{base_url}}/api/logs/all/VISITOR
```

#### 7.4 Get All Logs (GET /api/logs/all)
```
GET {{base_url}}/api/logs/all
```

#### 7.5 Get Log by ID (GET /api/logs/:id)
```
GET {{base_url}}/api/logs/{{log_id}}
```

#### 7.6 Get Logs by User (GET /api/logs/user/:userId)
```
GET {{base_url}}/api/logs/user/{{resident_id}}
```

#### 7.7 Get Logs by Entity (GET /api/logs/entity/:entityType/:entityId)
```
GET {{base_url}}/api/logs/entity/resident/{{resident_id}}
```

#### 7.8 Get Log Stats (GET /api/logs/stats)
```
GET {{base_url}}/api/logs/stats
```

#### 7.9 Clean Old Logs (POST /api/logs/clean)
```json
POST {{base_url}}/api/logs/clean
Content-Type: application/json

{
  "days": 90
}
```

---

### 8. QR Codes

#### 8.1 Validate QR (POST /api/qr/validate)
```json
POST {{base_url}}/api/qr/validate
Content-Type: application/json

{
  "qrCode": "QR_CODE_STRING_HERE"
}
```

#### 8.2 Check-In (POST /api/qr/check-in)
```json
POST {{base_url}}/api/qr/check-in
Content-Type: application/json

{
  "qrCode": "QR_CODE_STRING_HERE"
}
```

#### 8.3 Check-Out (POST /api/qr/check-out)
```json
POST {{base_url}}/api/qr/check-out
Content-Type: application/json

{
  "qrCode": "QR_CODE_STRING_HERE"
}
```

---

## ⚠️ Known Issues & Limitations

1. **Stub Endpoints** (Return "Endpoint en desarrollo"):
   - POST /api/resident/:id/frequent-visitors
   - POST /api/resident/:id/invitations

2. **Empty Array Stubs** (Return `[]`):
   - GET /api/resident/:id/visitors
   - GET /api/resident/:id/invitations
   - GET /api/resident/:id/vehicles
   - GET /api/resident/:id/frequent-visitors

3. **Search Endpoint Issue**:
   - If receiving "Internal server error", ensure:
     - RUT exists in database
     - RUT format is correct (12.345.678-9)
     - Column names use camelCase (`firstName`, not `firstname`)

4. **Password Hashing**:
   - Passwords in test data are hashed with bcrypt
   - Default test password: `admin123`

---

## 🔐 Authentication

Most endpoints require JWT authentication. Add to headers:

```
Authorization: Bearer {{token}}
```

The token is obtained from the login endpoint and automatically saved to Postman environment with the provided post-script.

---

## 📊 Testing Workflow

1. **Login** → Save token
2. **Create/Get Residents** → Save resident IDs
3. **Test CRUD operations** on each resource
4. **Verify relationships** (resident → visitors, vehicles, etc.)
5. **Test error cases** (invalid IDs, missing fields, etc.)

---

## 🐛 Debugging Tips

- Check backend terminal for actual SQL errors
- Verify column names match database schema (camelCase!)
- Ensure UUIDs are valid v4 format
- Check foreign key constraints
- Verify ENUM values match database types
