# 🚀 Guardian Comunitario API - Quick Start

## 📦 Archivos Incluidos

- ✅ `POSTMAN-GUIDE.md` - Guía completa de uso de Postman (100+ páginas)
- ✅ `GC-Backend-API.postman_collection.json` - Colección con 46 endpoints
- ✅ `GC-Backend-API.postman_environment.json` - Variables de entorno
- ✅ `database-setup.sql` - Script SQL completo de base de datos
- ✅ `BACKEND-IMPLEMENTATION-STATUS.md` - Estado de implementación

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Configurar Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Ejecutar script
\i database-setup.sql

# Verificar
\dt
```

### 2️⃣ Configurar Backend

```bash
# Instalar dependencias
cd Backend/gc-backend-api
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
npm run start:dev
```

### 3️⃣ Importar en Postman

1. Abrir Postman
2. **Import** → `GC-Backend-API.postman_collection.json`
3. **Environments** → Import → `GC-Backend-API.postman_environment.json`
4. Seleccionar environment "GC Backend API - Development"

### 4️⃣ Probar API

```
1. Ejecutar: Auth > 01. Login
2. Ejecutar: Residents > 02. Crear Residente
3. ✅ ¡Listo! Los demás endpoints ya funcionan
```

---

## 📊 Estructura de la Colección

```
GC Backend API (46 endpoints)
│
├── 01. Auth (1)
│   └── 01.1 Login
│
├── 02. Residents (14)
│   ├── 02.1 Crear Residente
│   ├── 02.2 Listar Residentes
│   ├── 02.3 Obtener por ID
│   ├── ...
│   └── 02.14 Estadísticas
│
├── 03. Visitantes (3)
│   ├── 03.1 Crear Visitante
│   ├── 03.2 Listar Visitantes
│   └── 03.3 Actualizar Estado
│
├── 04. Invitations (6)
│   ├── 04.1 Crear Invitación
│   ├── 04.2 Listar Invitaciones
│   ├── 04.3 Obtener por ID
│   ├── 04.4 Aprobar (genera QR)
│   ├── 04.5 Rechazar
│   └── 04.6 Cancelar
│
├── 05. Frequent Visitors (4)
│   ├── 05.1 Crear
│   ├── 05.2 Listar
│   ├── 05.3 Crear Invitación
│   └── 05.4 Eliminar
│
├── 06. Vehicles (9)
│   ├── 06.1 Registrar Vehículo
│   ├── 06.2 Listar Vehículos
│   ├── 06.3 Obtener por ID
│   ├── 06.4 Actualizar
│   ├── 06.5 Eliminar (soft)
│   ├── 06.6 Buscar por Patente
│   ├── 06.7 Verificar Duplicado
│   ├── 06.8 Estadísticas
│   └── 06.9 Reactivar
│
├── 07. Logs (9)
│   ├── 07.1 Crear Log
│   ├── 07.2 Logs del Día
│   ├── 07.3 Logs por Tipo
│   ├── 07.4 Todos los Logs
│   ├── 07.5 Log por ID
│   ├── 07.6 Logs por Usuario
│   ├── 07.7 Logs por Entidad
│   ├── 07.8 Estadísticas
│   └── 07.9 Limpiar Antiguos
│
└── 08. QR Codes (3)
    ├── 08.1 Validar QR
    ├── 08.2 Check-in
    └── 08.3 Check-out
```

---

## 🔑 Variables Importantes

| Variable | Se Auto-genera | Cuándo |
|----------|----------------|--------|
| `access_token` | ✅ | Al hacer Login |
| `resident_id` | ✅ | Al crear Residente |
| `visitor_id` | ✅ | Al crear Visitante |
| `invitation_id` | ✅ | Al crear Invitación |
| `qr_code` | ✅ | Al aprobar Invitación |
| `vehicle_id` | ✅ | Al registrar Vehículo |

---

## 🎯 Flujos Comunes

### Flujo 1: Registrar Visitante con QR
```
1. Login (01.1)
2. Crear Residente (02.1)
3. Crear Visitante (03.1)
4. Crear Invitación (04.1)
5. Aprobar Invitación (04.4) → Genera QR
6. Check-in (08.2) → Escanea QR
7. Check-out (08.3) → Registra salida
```

### Flujo 2: Gestión de Vehículos
```
1. Login (01.1)
2. Registrar Vehículo (06.1)
3. Verificar Duplicado (06.7)
4. Ver Estadísticas (06.8)
```

### Flujo 3: Visitante Frecuente
```
1. Login (01.1)
2. Crear Visitante Frecuente (05.1)
3. Crear Invitación desde Frecuente (05.3)
4. Aprobar Invitación (04.4)
```

---

## 🔧 Configuración del .env

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DATABASE=guardian_comunitario

# JWT
JWT_SECRET=tu_secret_key_super_seguro
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

---

## 📋 Validaciones Importantes

### RUT Chileno
- Formato: `12.345.678-9`
- Con puntos y guión

### Patente Chilena
- Formato: `ABCD-12`
- 4 letras mayúsculas + guión + 2 números

### Teléfono
- Formato: `+56912345678`
- Código país + 9 dígitos

### Año de Vehículo
- Rango: 1900 - 2025

---

## ⚠️ Troubleshooting

### Error: "401 Unauthorized"
**Solución:** Ejecutar Login nuevamente

### Error: "404 Not Found"
**Solución:** 
- Verificar que el backend esté corriendo
- Verificar `base_url` = `http://localhost:3000`

### Variables no se guardan
**Solución:**
- Verificar que el environment esté seleccionado
- Ver Postman Console (View > Show Postman Console)

### Base de datos no conecta
**Solución:**
```bash
# Verificar PostgreSQL
pg_isready

# Verificar usuario y password
psql -U postgres -d guardian_comunitario
```

---

## 📚 Documentación Completa

Para guía detallada, ver: **`POSTMAN-GUIDE.md`**

Incluye:
- ✅ Configuración paso a paso
- ✅ Descripción de cada endpoint
- ✅ Ejemplos de JSON
- ✅ Tests automáticos
- ✅ Mejores prácticas
- ✅ Troubleshooting avanzado

---

## ✅ Checklist de Instalación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada con `database-setup.sql`
- [ ] Node.js y npm instalados
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Backend corriendo (`npm run start:dev`)
- [ ] Postman instalado
- [ ] Colección importada
- [ ] Environment importado y seleccionado
- [ ] Login exitoso (token guardado)
- [ ] Primer residente creado

---

## 🎉 ¡Listo!

Si completaste todos los pasos del checklist, tu API está lista para usar.

**Próximo paso:** Explorar los 46 endpoints en Postman siguiendo `POSTMAN-GUIDE.md`

---

## 💡 Tips Útiles

1. **Backup de Variables:** Guarda los IDs importantes
2. **Múltiples Environments:** Crea uno para Development, Staging, Production
3. **Run Collection:** Ejecuta todos los tests automáticamente
4. **Postman Console:** Útil para debugging

---

## 📞 Soporte

- **Guía Completa:** `POSTMAN-GUIDE.md`
- **Estado del Backend:** `BACKEND-IMPLEMENTATION-STATUS.md`
- **Scripts SQL:** `database-setup.sql`

---

**Versión:** 1.0  
**Última Actualización:** 20 de noviembre de 2025  
**Endpoints:** 46/46 (100% ✅)
