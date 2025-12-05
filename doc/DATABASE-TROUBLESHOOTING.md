# 🔧 Troubleshooting - PostgreSQL Setup

## Problema 1: "psql no se reconoce como comando"

### Solución A: Usar scripts incluidos
```bash
# Windows CMD
setup-database.bat

# Windows PowerShell
.\setup-database.ps1
```

### Solución B: Agregar PostgreSQL al PATH
```powershell
# 1. Abrir "Variables de entorno"
# 2. En "Variables del sistema", editar "Path"
# 3. Agregar: C:\Program Files\PostgreSQL\18\bin
# 4. Reiniciar terminal
```

---

## Problema 2: "Autenticación password falló"

### Causa
Contraseña incorrecta del usuario `postgres`

### Solución 1: Recuperar/cambiar contraseña
```bash
# Método 1: Usar pgAdmin
# 1. Abrir pgAdmin 4
# 2. Click derecho en "Servers" > "Register" > "Server"
# 3. Probar con la contraseña que recuerdas

# Método 2: Cambiar contraseña (requiere acceso al servidor)
# 1. Abrir servicios de Windows
# 2. Detener "postgresql-x64-18"
# 3. Editar pg_hba.conf para usar "trust" temporalmente
# 4. Reiniciar servicio
# 5. Ejecutar: psql -U postgres
# 6. En psql: ALTER USER postgres WITH PASSWORD 'nueva_password';
# 7. Revertir pg_hba.conf a "md5" o "scram-sha-256"
# 8. Reiniciar servicio
```

### Solución 2: Usar variable de entorno
```powershell
# PowerShell
$env:PGPASSWORD = "tu_password"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f database-setup.sql
```

```bash
# CMD
set PGPASSWORD=tu_password
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f database-setup.sql
```

### Solución 3: Crear archivo .pgpass
```bash
# Windows: C:\Users\TuUsuario\AppData\Roaming\postgresql\pgpass.conf
# Contenido:
localhost:5432:*:postgres:tu_password

# Permisos: Solo lectura para el usuario actual
```

---

## Problema 3: "No se puede conectar al servidor"

### Causa
PostgreSQL no está corriendo

### Solución
```powershell
# PowerShell (como Administrador)
# Ver servicios PostgreSQL
Get-Service -Name "postgresql*"

# Iniciar servicio
Start-Service postgresql-x64-18

# Verificar estado
Get-Service postgresql-x64-18
```

```bash
# Alternativa: Servicios de Windows
# 1. Win + R > services.msc
# 2. Buscar "postgresql-x64-18"
# 3. Click derecho > Iniciar
# 4. Configurar inicio automático
```

---

## Problema 4: "Puerto 5432 ya está en uso"

### Verificar qué usa el puerto
```powershell
# PowerShell
netstat -ano | findstr :5432

# Ver el proceso
Get-Process -Id <PID>
```

### Solución 1: Detener otro servicio PostgreSQL
```powershell
# Si hay múltiples instancias
Get-Service postgresql* | Stop-Service
Start-Service postgresql-x64-18
```

### Solución 2: Cambiar puerto en PostgreSQL
```bash
# 1. Editar: C:\Program Files\PostgreSQL\18\data\postgresql.conf
# 2. Cambiar: port = 5433
# 3. Reiniciar servicio
# 4. Actualizar scripts para usar -p 5433
```

---

## Problema 5: "Base de datos ya existe"

### Opción A: Eliminar y recrear
```sql
-- En psql
DROP DATABASE IF EXISTS guardian_comunitario;
-- Luego ejecutar database-setup.sql
```

### Opción B: Solo crear tablas faltantes
```sql
-- Conectar a la BD existente
psql -U postgres -d guardian_comunitario

-- Ejecutar solo las secciones necesarias del script
```

---

## Problema 6: Script ejecuta pero con errores

### Verificar logs
```powershell
# PowerShell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f database-setup.sql 2>&1 | Tee-Object -FilePath setup-log.txt

# Revisar archivo
notepad setup-log.txt
```

### Errores comunes:

#### "relation already exists"
```sql
-- Agregar IF NOT EXISTS
DROP TABLE IF EXISTS nombre_tabla CASCADE;
CREATE TABLE IF NOT EXISTS nombre_tabla ...
```

#### "type already exists"
```sql
-- Para enums
DROP TYPE IF EXISTS nombre_enum CASCADE;
CREATE TYPE nombre_enum AS ENUM ...
```

#### "must be owner of database"
```sql
-- Ejecutar como superusuario
psql -U postgres -f database-setup.sql
```

---

## Problema 7: Encoding/Charset issues

### Solución
```sql
-- Crear BD con encoding UTF-8
CREATE DATABASE guardian_comunitario
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Chile.UTF8'
    LC_CTYPE = 'Spanish_Chile.UTF8';
```

Si falla el locale chileno:
```sql
-- Usar locale por defecto
CREATE DATABASE guardian_comunitario
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C';
```

---

## Verificación de Instalación Exitosa

### 1. Conectar a la base de datos
```bash
psql -U postgres -d guardian_comunitario
```

### 2. Verificar tablas
```sql
\dt
-- Debería mostrar 7 tablas:
-- users, residents, visitors, invitations, 
-- frequent_visitors, vehicles, logs
```

### 3. Verificar enums
```sql
\dT
-- Debería mostrar 6 enums:
-- user_role, visitor_status, invitation_status,
-- vehicle_type, log_type, log_action
```

### 4. Verificar vistas
```sql
\dv
-- Debería mostrar 3 vistas:
-- active_visitors_today, vehicle_stats, pending_invitations
```

### 5. Verificar funciones
```sql
\df
-- Debería mostrar 3 funciones:
-- clean_old_logs, get_daily_stats, update_timestamp
```

### 6. Contar registros (debería estar vacío)
```sql
SELECT COUNT(*) FROM residents;
-- Resultado: 0
```

---

## Método Alternativo: Usar pgAdmin

### Paso 1: Abrir pgAdmin 4
```
C:\Program Files\PostgreSQL\18\pgAdmin 4\bin\pgAdmin4.exe
```

### Paso 2: Conectar al servidor
- Click en "Servers" > "PostgreSQL 18"
- Ingresar contraseña

### Paso 3: Crear base de datos
- Click derecho en "Databases"
- "Create" > "Database"
- Name: `guardian_comunitario`
- Encoding: UTF8
- Save

### Paso 4: Ejecutar script
- Click derecho en `guardian_comunitario`
- "Query Tool"
- Abrir archivo: `database-setup.sql`
- Click en "Execute" (⚡)

### Paso 5: Verificar
- Refrescar `guardian_comunitario`
- Ver "Schemas" > "public" > "Tables"
- Deberías ver 7 tablas

---

## Método Rápido: Una Línea

### Con contraseña en variable
```powershell
# PowerShell
$env:PGPASSWORD="tu_password"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f database-setup.sql
```

### Con prompt de contraseña
```powershell
# PowerShell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -W -f database-setup.sql
```

---

## Checklist de Diagnóstico

- [ ] PostgreSQL instalado (versión 14+)
- [ ] Servicio PostgreSQL corriendo
- [ ] Puerto 5432 disponible (o puerto alternativo configurado)
- [ ] Usuario `postgres` existe
- [ ] Contraseña del usuario conocida
- [ ] Archivo `database-setup.sql` existe
- [ ] Permisos de escritura en carpeta de PostgreSQL
- [ ] Firewall no bloquea conexión local
- [ ] No hay otras instancias de PostgreSQL corriendo

---

## Comandos Útiles

### Información del sistema
```bash
# Ver versión
psql --version

# Ver servicios
sc query postgresql-x64-18

# Ver puerto de escucha
netstat -an | findstr :5432

# Ver procesos PostgreSQL
tasklist | findstr postgres
```

### Conectar de diferentes formas
```bash
# Método 1: Usuario postgres, BD por defecto
psql -U postgres

# Método 2: Usuario postgres, BD específica
psql -U postgres -d guardian_comunitario

# Método 3: Con host y puerto explícitos
psql -U postgres -h localhost -p 5432 -d guardian_comunitario

# Método 4: Ejecutar comando SQL directo
psql -U postgres -c "SELECT version();"

# Método 5: Ejecutar archivo SQL
psql -U postgres -f database-setup.sql
```

---

## Ayuda Adicional

### Logs de PostgreSQL
```
C:\Program Files\PostgreSQL\18\data\log\
```

### Configuración
```
C:\Program Files\PostgreSQL\18\data\postgresql.conf
C:\Program Files\PostgreSQL\18\data\pg_hba.conf
```

### Documentación oficial
```
https://www.postgresql.org/docs/18/
```

---

## ¿Aún tienes problemas?

1. Revisa los logs: `C:\Program Files\PostgreSQL\18\data\log\`
2. Verifica la versión: `psql --version`
3. Asegúrate de que el servicio esté corriendo
4. Prueba conectar con pgAdmin primero
5. Considera reinstalar PostgreSQL si todo lo demás falla

---

**Última actualización:** 20 de noviembre de 2025  
**PostgreSQL:** 18  
**OS:** Windows
