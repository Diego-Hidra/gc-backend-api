-- ============================================================================
-- GUARDIAN COMUNITARIO - DATABASE COMPLETE SETUP (UNIFIED)
-- ============================================================================
-- Versión: 2.0 (Integrado init.sql + database-setup.sql)
-- Fecha: 4 de diciembre de 2025
-- Descripción: Script completo unificado con reconocimiento facial (pgvector),
--              gestión de residentes, visitantes, guardias, vehículos y logs
-- ============================================================================

-- ============================================================================
-- 1. CREAR BASE DE DATOS (ejecutar como superuser si es necesario)
-- ============================================================================

-- Descomentar si necesitas crear la base de datos desde cero
-- DROP DATABASE IF EXISTS guardian_comunitario;
-- CREATE DATABASE guardian_comunitario
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Spanish_Chile.1252'
--     LC_CTYPE = 'Spanish_Chile.1252'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- Conectar a la base de datos
\c guardian_comunitario

-- ============================================================================
-- 2. CREAR EXTENSIONES
-- ============================================================================

-- UUID para IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgvector para reconocimiento facial con IA
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 3. CREAR ENUMS
-- ============================================================================

-- Enum para tipos de usuario
CREATE TYPE user_role AS ENUM ('resident', 'guard', 'admin');

-- Enum para estado de visitante
CREATE TYPE visitor_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROPERTY', 'COMPLETED');

-- Enum para estado de invitación
CREATE TYPE invitation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'USED', 'EXPIRED', 'CANCELLED');

-- Enum para tipo de vehículo
CREATE TYPE vehicle_type AS ENUM ('SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'MOTORCYCLE', 'OTHER');

-- Enum para tipo de log
CREATE TYPE log_type AS ENUM ('access', 'visitor', 'vehicle', 'incident', 'system');

-- Enum para acción de log
CREATE TYPE log_action AS ENUM (
    'check_in', 'check_out', 'access_denied', 'access_granted',
    'visitor_registered', 'visitor_approved', 'visitor_rejected',
    'invitation_created', 'invitation_used', 'invitation_cancelled',
    'vehicle_registered', 'vehicle_updated', 'vehicle_deleted', 'vehicle_activated',
    'incident_reported', 'incident_resolved',
    'user_login', 'user_logout', 'system_error', 'config_changed'
);

-- Enum para método de entrada (reconocimiento)
CREATE TYPE entry_method AS ENUM ('facial', 'lpr', 'qr', 'manual', 'invitation');

-- ============================================================================
-- 4. CREAR TABLAS INDEPENDIENTES (sin dependencias)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Tabla: buildings (edificios/condominios)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL UNIQUE,
    "totalBlocks" INTEGER,
    "totalLots" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para buildings
CREATE INDEX idx_buildings_address ON buildings(address);
CREATE INDEX idx_buildings_active ON buildings("isActive");

-- ----------------------------------------------------------------------------
-- 4.2 Tabla: users (tabla padre - autenticación general)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'resident',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 5. CREAR TABLAS CON DEPENDENCIAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Tabla: residents (residentes con reconocimiento facial)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'resident',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    -- Información de ubicación
    block VARCHAR(10) NOT NULL,
    "lotNumber" VARCHAR(10) NOT NULL,
    floor VARCHAR(10),
    apartment VARCHAR(10),
    
    -- Información del edificio (FK)
    "buildingId" UUID,
    
    -- Reconocimiento facial con IA (vector de 512 dimensiones - FaceNet PyTorch)
    "faceVector" vector(512),
    
    -- URL de la foto de perfil
    "profilePicture" TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_resident_building FOREIGN KEY ("buildingId") REFERENCES buildings(id) ON DELETE SET NULL
);

-- Índices para residents
CREATE INDEX idx_residents_email ON residents(email);
CREATE INDEX idx_residents_rut ON residents(rut);
CREATE INDEX idx_residents_block ON residents(block);
CREATE INDEX idx_residents_lot ON residents("lotNumber");
CREATE INDEX idx_residents_building ON residents("buildingId");
CREATE INDEX idx_residents_active ON residents("isActive");

-- ----------------------------------------------------------------------------
-- 5.2 Tabla: guards (guardias de seguridad)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'guard',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    -- Información específica de guardias
    "employeeNumber" VARCHAR(50),
    "hireDate" DATE,
    
    -- Reconocimiento facial (opcional para guardias)
    "faceVector" vector(512),
    "profilePicture" TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para guards
CREATE INDEX idx_guards_email ON guards(email);
CREATE INDEX idx_guards_rut ON guards(rut);
CREATE INDEX idx_guards_active ON guards("isActive");

-- ----------------------------------------------------------------------------
-- 5.3 Tabla: administrators (administradores del sistema)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    -- Permisos específicos (JSON con permisos granulares)
    permissions JSONB,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para administrators
CREATE INDEX idx_administrators_email ON administrators(email);
CREATE INDEX idx_administrators_active ON administrators("isActive");

-- ----------------------------------------------------------------------------
-- 5.4 Tabla: shifts (turnos de guardias)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "guardId" UUID NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "actualStartTime" TIMESTAMP,
    "actualEndTime" TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    notes TEXT,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_shift_guard FOREIGN KEY ("guardId") REFERENCES guards(id) ON DELETE CASCADE,
    CONSTRAINT chk_shift_times CHECK ("endTime" > "startTime")
);

-- Índices para shifts
CREATE INDEX idx_shifts_guard ON shifts("guardId");
CREATE INDEX idx_shifts_start ON shifts("startTime");
CREATE INDEX idx_shifts_status ON shifts(status);

-- ----------------------------------------------------------------------------
-- 5.5 Tabla: visitors (visitantes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    status visitor_status NOT NULL DEFAULT 'PENDING',
    
    -- Horarios
    "scheduledDate" TIMESTAMP NOT NULL,
    "checkInTime" TIMESTAMP,
    "checkOutTime" TIMESTAMP,
    
    -- Información de la visita
    "hasVehicle" BOOLEAN NOT NULL DEFAULT false,
    "vehicleInfo" JSONB,
    
    -- Aprobación/Rechazo
    "rejectionReason" TEXT,
    notes TEXT,
    
    -- Relación con residente
    "residentId" UUID NOT NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_visitor_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

-- Índices para visitors
CREATE INDEX idx_visitors_resident ON visitors("residentId");
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_scheduled_date ON visitors("scheduledDate");
CREATE INDEX idx_visitors_rut ON visitors(rut);

-- ----------------------------------------------------------------------------
-- 5.6 Tabla: invitations (invitaciones con QR)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Fechas
    "scheduledDate" TIMESTAMP NOT NULL,
    "expirationDate" TIMESTAMP,
    
    -- QR Code
    "qrCode" TEXT UNIQUE,
    "qrSignature" TEXT, -- Firma HMAC para validación
    
    -- Estado
    status invitation_status NOT NULL DEFAULT 'PENDING',
    
    -- Información de la visita
    "hasVehicle" BOOLEAN DEFAULT false,
    "vehicleInfo" JSONB,
    
    -- Horarios reales
    "checkInTime" TIMESTAMP,
    "checkOutTime" TIMESTAMP,
    
    -- Razones de rechazo/cancelación
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    notes TEXT,
    
    -- Relaciones
    "residentId" UUID NOT NULL,
    "visitorId" UUID,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_invitation_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitation_visitor FOREIGN KEY ("visitorId") REFERENCES visitors(id) ON DELETE SET NULL
);

-- Índices para invitations
CREATE INDEX idx_invitations_resident ON invitations("residentId");
CREATE INDEX idx_invitations_visitor ON invitations("visitorId");
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_qr ON invitations("qrCode");
CREATE INDEX idx_invitations_scheduled_date ON invitations("scheduledDate");
CREATE INDEX idx_invitations_rut ON invitations(rut);

-- ----------------------------------------------------------------------------
-- 5.7 Tabla: frequent_visitors (visitantes frecuentes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frequent_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Estadísticas de uso
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP,
    
    -- Estado
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    -- Información de vehículo
    "hasVehicle" BOOLEAN DEFAULT false,
    "vehicleInfo" JSONB,
    
    notes TEXT,
    
    -- Relación con residente
    "residentId" UUID NOT NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_frequent_visitor_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

-- Índices para frequent_visitors
CREATE INDEX idx_frequent_visitors_resident ON frequent_visitors("residentId");
CREATE INDEX idx_frequent_visitors_rut ON frequent_visitors(rut);
CREATE INDEX idx_frequent_visitors_active ON frequent_visitors("isActive");

-- ----------------------------------------------------------------------------
-- 5.8 Tabla: vehicles (vehículos registrados)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "licensePlate" VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(30) NOT NULL,
    type vehicle_type NOT NULL,
    
    -- Estado
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deleteReason" TEXT,
    "deleteNotes" TEXT,
    
    -- Relación con residente
    "residentId" UUID NOT NULL,
    
    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_vehicle_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT chk_vehicle_year CHECK (year >= 1900 AND year <= 2100)
);

-- Índices para vehicles
CREATE INDEX idx_vehicles_resident ON vehicles("residentId");
CREATE INDEX idx_vehicles_plate ON vehicles("licensePlate");
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_active ON vehicles("isActive");

-- ----------------------------------------------------------------------------
-- 5.9 Tabla: entry_logs (registros de acceso completos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Método de entrada
    "entryMethod" entry_method NOT NULL,
    
    -- Referencias a entidades involucradas (pueden ser NULL según el tipo de acceso)
    "visitorId" UUID,
    "residentId" UUID,
    "guardId" UUID,
    "vehicleId" UUID,
    "invitationId" UUID,
    
    -- Timestamps de entrada/salida
    "arrivalTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "departureTime" TIMESTAMP,
    
    -- Payload con datos crudos del evento (de IA, RabbitMQ, etc.)
    payload JSONB,
    
    -- Metadatos adicionales
    metadata JSONB,
    
    -- Foreign Keys (opcionales según el tipo de entrada)
    CONSTRAINT fk_entry_log_visitor FOREIGN KEY ("visitorId") REFERENCES visitors(id) ON DELETE SET NULL,
    CONSTRAINT fk_entry_log_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE SET NULL,
    CONSTRAINT fk_entry_log_guard FOREIGN KEY ("guardId") REFERENCES guards(id) ON DELETE SET NULL,
    CONSTRAINT fk_entry_log_vehicle FOREIGN KEY ("vehicleId") REFERENCES vehicles(id) ON DELETE SET NULL,
    CONSTRAINT fk_entry_log_invitation FOREIGN KEY ("invitationId") REFERENCES invitations(id) ON DELETE SET NULL
);

-- Índices para entry_logs
CREATE INDEX idx_entry_logs_method ON entry_logs("entryMethod");
CREATE INDEX idx_entry_logs_visitor ON entry_logs("visitorId");
CREATE INDEX idx_entry_logs_resident ON entry_logs("residentId");
CREATE INDEX idx_entry_logs_arrival ON entry_logs("arrivalTime");
CREATE INDEX idx_entry_logs_departure ON entry_logs("departureTime");

-- ----------------------------------------------------------------------------
-- 5.10 Tabla: logs (auditoría general del sistema)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type log_type NOT NULL,
    action log_action NOT NULL,
    description VARCHAR(500) NOT NULL,
    
    -- Usuario que realizó la acción
    "userId" VARCHAR(50),
    
    -- Entidad afectada
    "entityType" VARCHAR(100),
    "entityId" VARCHAR(50),
    
    -- Detalles adicionales
    details JSONB,
    metadata JSONB,
    
    -- Información de la request
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    
    -- Timestamp
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Severidad
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    
    CONSTRAINT chk_log_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Índices para logs
CREATE INDEX idx_logs_type ON logs(type);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_user ON logs("userId");
CREATE INDEX idx_logs_entity ON logs("entityType", "entityId");
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_severity ON logs(severity);

-- ============================================================================
-- 6. TABLAS DE RELACIÓN (Many-to-Many)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Tabla: admin_adds_resident (administrador agrega residente)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_adds_resident (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "adminId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_adds_resident_admin FOREIGN KEY ("adminId") REFERENCES administrators(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_adds_resident_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_adds_resident_admin ON admin_adds_resident("adminId");
CREATE INDEX idx_admin_adds_resident_resident ON admin_adds_resident("residentId");

-- ----------------------------------------------------------------------------
-- 6.2 Tabla: admin_adds_guard (administrador agrega guardia)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_adds_guard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "adminId" UUID NOT NULL,
    "guardId" UUID NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_adds_guard_admin FOREIGN KEY ("adminId") REFERENCES administrators(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_adds_guard_guard FOREIGN KEY ("guardId") REFERENCES guards(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_adds_guard_admin ON admin_adds_guard("adminId");
CREATE INDEX idx_admin_adds_guard_guard ON admin_adds_guard("guardId");

-- ----------------------------------------------------------------------------
-- 6.3 Tabla: admin_adds_vehicle (administrador agrega vehículo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_adds_vehicle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "adminId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_admin_adds_vehicle_admin FOREIGN KEY ("adminId") REFERENCES administrators(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_adds_vehicle_vehicle FOREIGN KEY ("vehicleId") REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_adds_vehicle_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_adds_vehicle_admin ON admin_adds_vehicle("adminId");
CREATE INDEX idx_admin_adds_vehicle_vehicle ON admin_adds_vehicle("vehicleId");

-- ============================================================================
-- 7. CREAR TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- ============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updatedAt
CREATE TRIGGER update_buildings_timestamp BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_residents_timestamp BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_guards_timestamp BEFORE UPDATE ON guards FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_administrators_timestamp BEFORE UPDATE ON administrators FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_shifts_timestamp BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_visitors_timestamp BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_invitations_timestamp BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_frequent_visitors_timestamp BEFORE UPDATE ON frequent_visitors FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_vehicles_timestamp BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 8. CREAR VISTAS ÚTILES
-- ============================================================================

-- Vista: Visitantes activos hoy
CREATE OR REPLACE VIEW active_visitors_today AS
SELECT 
    v.id,
    v."firstName" || ' ' || v."lastName" AS "visitorName",
    v.rut,
    v.status,
    v."checkInTime",
    r."firstName" || ' ' || r."lastName" AS "residentName",
    r.block,
    r."lotNumber"
FROM visitors v
INNER JOIN residents r ON v."residentId" = r.id
WHERE DATE(v."scheduledDate") = CURRENT_DATE
    AND v.status IN ('APPROVED', 'IN_PROPERTY');

-- Vista: Estadísticas de vehículos por residente
CREATE OR REPLACE VIEW vehicle_stats AS
SELECT 
    r.id AS "residentId",
    r."firstName" || ' ' || r."lastName" AS "residentName",
    r.block,
    r."lotNumber",
    COUNT(v.id) AS "totalVehicles",
    COUNT(CASE WHEN v."isActive" = true THEN 1 END) AS "activeVehicles",
    string_agg(v."licensePlate", ', ') AS "licensePlates"
FROM residents r
LEFT JOIN vehicles v ON r.id = v."residentId"
GROUP BY r.id, r."firstName", r."lastName", r.block, r."lotNumber";

-- Vista: Invitaciones pendientes
CREATE OR REPLACE VIEW pending_invitations AS
SELECT 
    i.id,
    i."firstName" || ' ' || i."lastName" AS "visitorName",
    i.rut AS "visitorRut",
    i."scheduledDate",
    i."expirationDate",
    r."firstName" || ' ' || r."lastName" AS "residentName",
    r.phone AS "residentPhone",
    r.block,
    r."lotNumber",
    CASE 
        WHEN i."expirationDate" < CURRENT_TIMESTAMP THEN 'Expirada'
        WHEN i."scheduledDate" < CURRENT_TIMESTAMP THEN 'Atrasada'
        ELSE 'Vigente'
    END AS status_detail
FROM invitations i
INNER JOIN residents r ON i."residentId" = r.id
WHERE i.status = 'PENDING';

-- Vista: Turnos activos de guardias
CREATE OR REPLACE VIEW active_shifts AS
SELECT 
    s.id,
    g."firstName" || ' ' || g."lastName" AS "guardName",
    g.phone AS "guardPhone",
    s."startTime",
    s."endTime",
    s.status,
    s.notes
FROM shifts s
INNER JOIN guards g ON s."guardId" = g.id
WHERE s.status = 'in_progress'
    OR (s.status = 'scheduled' AND s."startTime" <= CURRENT_TIMESTAMP + INTERVAL '1 hour');

-- Vista: Resumen de accesos de hoy
CREATE OR REPLACE VIEW daily_access_summary AS
SELECT 
    el."entryMethod",
    COUNT(*) AS total_accesses,
    COUNT(CASE WHEN el."departureTime" IS NULL THEN 1 END) AS currently_inside,
    COUNT(CASE WHEN el."departureTime" IS NOT NULL THEN 1 END) AS already_left
FROM entry_logs el
WHERE DATE(el."arrivalTime") = CURRENT_DATE
GROUP BY el."entryMethod";

-- ============================================================================
-- 9. CREAR FUNCIONES ÚTILES
-- ============================================================================

-- Función: Limpiar logs antiguos
CREATE OR REPLACE FUNCTION clean_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM logs 
    WHERE timestamp < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener estadísticas del día
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS TABLE (
    total_check_ins BIGINT,
    total_check_outs BIGINT,
    visitors_in_property BIGINT,
    pending_invitations BIGINT,
    active_guards BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM logs 
         WHERE DATE(timestamp) = CURRENT_DATE 
         AND action = 'check_in') AS total_check_ins,
        (SELECT COUNT(*) FROM logs 
         WHERE DATE(timestamp) = CURRENT_DATE 
         AND action = 'check_out') AS total_check_outs,
        (SELECT COUNT(*) FROM visitors 
         WHERE status = 'IN_PROPERTY') AS visitors_in_property,
        (SELECT COUNT(*) FROM invitations 
         WHERE status = 'PENDING' 
         AND "expirationDate" > CURRENT_TIMESTAMP) AS pending_invitations,
        (SELECT COUNT(*) FROM shifts 
         WHERE status = 'in_progress') AS active_guards;
END;
$$ LANGUAGE plpgsql;

-- Función: Validar formato de RUT chileno
CREATE OR REPLACE FUNCTION validate_rut(rut_input VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    rut_clean VARCHAR;
    rut_number INTEGER;
    rut_digit VARCHAR(1);
    calculated_digit VARCHAR(1);
    sum INTEGER := 0;
    multiplier INTEGER := 2;
    remainder INTEGER;
BEGIN
    -- Limpiar el RUT (quitar puntos y guión)
    rut_clean := REPLACE(REPLACE(rut_input, '.', ''), '-', '');
    
    -- Extraer número y dígito verificador
    rut_number := SUBSTRING(rut_clean FROM 1 FOR LENGTH(rut_clean) - 1)::INTEGER;
    rut_digit := UPPER(SUBSTRING(rut_clean FROM LENGTH(rut_clean) FOR 1));
    
    -- Calcular dígito verificador
    WHILE rut_number > 0 LOOP
        sum := sum + (rut_number % 10) * multiplier;
        rut_number := rut_number / 10;
        multiplier := multiplier + 1;
        IF multiplier > 7 THEN
            multiplier := 2;
        END IF;
    END LOOP;
    
    remainder := 11 - (sum % 11);
    
    IF remainder = 11 THEN
        calculated_digit := '0';
    ELSIF remainder = 10 THEN
        calculated_digit := 'K';
    ELSE
        calculated_digit := remainder::VARCHAR;
    END IF;
    
    RETURN rut_digit = calculated_digit;
END;
$$ LANGUAGE plpgsql;

-- Función: Incrementar contador de visitas de visitante frecuente
CREATE OR REPLACE FUNCTION increment_frequent_visitor_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        -- Buscar si existe un visitante frecuente con este RUT
        UPDATE frequent_visitors
        SET "visitCount" = "visitCount" + 1,
            "lastVisit" = CURRENT_TIMESTAMP
        WHERE rut = NEW.rut
            AND "residentId" = NEW."residentId"
            AND "isActive" = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para incrementar contador
CREATE TRIGGER update_frequent_visitor_count
    AFTER UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION increment_frequent_visitor_count();

-- ============================================================================
-- 10. INSERTAR DATOS DE PRUEBA
-- ============================================================================

-- Insertar Edificio de prueba
INSERT INTO buildings (id, name, address, "totalBlocks", "totalLots") VALUES 
(uuid_generate_v4(), 'Edificio Central', 'Avenida Principal 123', 5, 50)
ON CONFLICT (address) DO NOTHING;

-- Insertar Residentes de prueba (con contraseñas bcrypt)
-- NOTA: Password123! hasheado = $2b$10$9raH37jNPQ1Og3fwoOixCOyAMWAhHEIHr8DFkA2Ax0NCzBivVqkRG
INSERT INTO residents (
    id, email, password, "firstName", "lastName", rut, phone, 
    block, "lotNumber", floor, apartment, "profilePicture"
) VALUES 
(
    uuid_generate_v4(),
    'test.resident@guardian.com',
    '$2b$10$9raH37jNPQ1Og3fwoOixCOyAMWAhHEIHr8DFkA2Ax0NCzBivVqkRG',
    'Test',
    'Resident',
    '20365783-8',
    '+56 9 1234 5668',
    '5',
    '501',
    '5',
    '01',
    'https://avatar.iran.liara.run/public/boy'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO residents (
    id, email, password, "firstName", "lastName", rut, phone, 
    block, "lotNumber", floor, apartment
) VALUES 
(
    uuid_generate_v4(),
    'maria.gomez@guardian.com',
    '$2b$10$9raH37jNPQ1Og3fwoOixCOyAMWAhHEIHr8DFkA2Ax0NCzBivVqkRG',
    'Maria',
    'Gomez',
    '19.500.000-K',
    '+56998765432',
    'A',
    '102',
    '1',
    '02'
)
ON CONFLICT (email) DO NOTHING;

-- Insertar Guardia de prueba
INSERT INTO guards (
    id, email, password, "firstName", "lastName", rut, phone, 
    "employeeNumber", "hireDate"
) VALUES 
(
    uuid_generate_v4(),
    'guard@guardian.com',
    '$2b$10$tZznxDqdTgwZ1myXZpxGy.Vnl3ETMymwt6BHnLkIrVH7chvkULLIy',
    'Carlos',
    'Muñoz',
    '16.789.012-3',
    '+56987654321',
    'GRD-001',
    '2024-01-15'
)
ON CONFLICT (email) DO NOTHING;

-- Insertar Administrador de prueba
INSERT INTO administrators (
    id, email, password, "firstName", "lastName", rut, phone,
    permissions
) VALUES 
(
    uuid_generate_v4(),
    'admin@guardian.com',
    '$2b$10$tZznxDqdTgwZ1myXZpxGy.Vnl3ETMymwt6BHnLkIrVH7chvkULLIy',
    'Admin',
    'Sistema',
    '15.000.000-1',
    '+56900000000',
    '{"all": true}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 11. COMENTARIOS EN TABLAS Y COLUMNAS
-- ============================================================================

COMMENT ON TABLE buildings IS 'Edificios o condominios del sistema';
COMMENT ON TABLE users IS 'Tabla padre para autenticación general';
COMMENT ON TABLE residents IS 'Residentes con reconocimiento facial (vector 512D) y ubicación';
COMMENT ON TABLE guards IS 'Guardias de seguridad con turnos asignados';
COMMENT ON TABLE administrators IS 'Administradores del sistema con permisos granulares';
COMMENT ON TABLE shifts IS 'Turnos de trabajo de los guardias';
COMMENT ON TABLE visitors IS 'Visitantes con estados y horarios de entrada/salida';
COMMENT ON TABLE invitations IS 'Invitaciones con código QR y firma HMAC';
COMMENT ON TABLE frequent_visitors IS 'Visitantes frecuentes registrados por residentes';
COMMENT ON TABLE vehicles IS 'Vehículos registrados de residentes';
COMMENT ON TABLE entry_logs IS 'Registro completo de accesos (facial, LPR, QR, manual)';
COMMENT ON TABLE logs IS 'Auditoría general del sistema';

COMMENT ON COLUMN residents."faceVector" IS 'Vector de 512 dimensiones para reconocimiento facial (FaceNet PyTorch)';
COMMENT ON COLUMN invitations."qrSignature" IS 'Firma HMAC-SHA256 para validación del QR';

-- ============================================================================
-- 12. VALIDAR INSTALACIÓN
-- ============================================================================

-- Verificar extensiones
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');

-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar enums creados
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

-- Verificar vistas creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Guardian Comunitario - Setup Completo';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Extensiones: uuid-ossp, pgvector';
    RAISE NOTICE 'Tablas: 16 (con reconocimiento facial)';
    RAISE NOTICE 'Enums: 7';
    RAISE NOTICE 'Vistas: 5';
    RAISE NOTICE 'Funciones: 4';
    RAISE NOTICE 'Triggers: 11';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '  - Reconocimiento Facial (vector 512D)';
    RAISE NOTICE '  - QR con firma HMAC';
    RAISE NOTICE '  - Gestión de Guardias y Turnos';
    RAISE NOTICE '  - Entry Logs completos';
    RAISE NOTICE '  - Auditoría con severidad';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuario de prueba creado:';
    RAISE NOTICE '  Email: test.resident@guardian.com';
    RAISE NOTICE '  Pass: Password123!';
    RAISE NOTICE '========================================';
END $$;
