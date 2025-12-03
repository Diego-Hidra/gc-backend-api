-- ============================================================================
-- GUARDIAN COMUNITARIO - DATABASE SETUP
-- ============================================================================
-- Versión: 1.0
-- Fecha: 20 de noviembre de 2025
-- Descripción: Script completo para crear la base de datos PostgreSQL
-- ============================================================================

-- ============================================================================
-- 1. CREAR BASE DE DATOS (ejecutar como superuser)
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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- ============================================================================
-- 4. CREAR TABLAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Tabla: users (tabla padre con herencia)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
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

-- ----------------------------------------------------------------------------
-- 4.2 Tabla: residents (extiende users con campos adicionales)
-- ----------------------------------------------------------------------------
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'resident',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    block VARCHAR(10) NOT NULL,
    "lotNumber" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para residents
CREATE INDEX idx_residents_block ON residents(block);
CREATE INDEX idx_residents_lot ON residents("lotNumber");

-- ----------------------------------------------------------------------------
-- 4.3 Tabla: visitors
-- ----------------------------------------------------------------------------
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    status visitor_status NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP NOT NULL,
    "checkInTime" TIMESTAMP,
    "checkOutTime" TIMESTAMP,
    "visitPurpose" TEXT,
    "hasVehicle" BOOLEAN NOT NULL DEFAULT false,
    "vehicleInfo" JSONB,
    "rejectionReason" TEXT,
    notes TEXT,
    "residentId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_visitor_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

-- Índices para visitors
CREATE INDEX idx_visitors_resident ON visitors("residentId");
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_scheduled_date ON visitors("scheduledDate");
CREATE INDEX idx_visitors_rut ON visitors(rut);

-- ----------------------------------------------------------------------------
-- 4.4 Tabla: invitations
-- ----------------------------------------------------------------------------
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "visitorName" VARCHAR(200) NOT NULL,
    "visitorRut" VARCHAR(20) NOT NULL,
    "scheduledDate" TIMESTAMP NOT NULL,
    "expirationDate" TIMESTAMP,
    "qrCode" TEXT UNIQUE,
    status invitation_status NOT NULL DEFAULT 'PENDING',
    "visitPurpose" TEXT,
    "checkInTime" TIMESTAMP,
    "checkOutTime" TIMESTAMP,
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    "residentId" UUID NOT NULL,
    "visitorId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitation_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitation_visitor FOREIGN KEY ("visitorId") REFERENCES visitors(id) ON DELETE SET NULL
);

-- Índices para invitations
CREATE INDEX idx_invitations_resident ON invitations("residentId");
CREATE INDEX idx_invitations_visitor ON invitations("visitorId");
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_qr ON invitations("qrCode");
CREATE INDEX idx_invitations_scheduled_date ON invitations("scheduledDate");

-- ----------------------------------------------------------------------------
-- 4.5 Tabla: frequent_visitors
-- ----------------------------------------------------------------------------
CREATE TABLE frequent_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    rut VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    relationship VARCHAR(100),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vehicleInfo" JSONB,
    notes TEXT,
    "residentId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_frequent_visitor_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE
);

-- Índices para frequent_visitors
CREATE INDEX idx_frequent_visitors_resident ON frequent_visitors("residentId");
CREATE INDEX idx_frequent_visitors_rut ON frequent_visitors(rut);
CREATE INDEX idx_frequent_visitors_active ON frequent_visitors("isActive");

-- ----------------------------------------------------------------------------
-- 4.6 Tabla: vehicles
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "licensePlate" VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(30) NOT NULL,
    type vehicle_type NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deleteReason" TEXT,
    "deleteNotes" TEXT,
    "residentId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_resident FOREIGN KEY ("residentId") REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT chk_vehicle_year CHECK (year >= 1900 AND year <= 2100)
);

-- Índices para vehicles
CREATE INDEX idx_vehicles_resident ON vehicles("residentId");
CREATE INDEX idx_vehicles_plate ON vehicles("licensePlate");
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_active ON vehicles("isActive");

-- ----------------------------------------------------------------------------
-- 4.7 Tabla: logs
-- ----------------------------------------------------------------------------
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type log_type NOT NULL,
    action log_action NOT NULL,
    description VARCHAR(500) NOT NULL,
    "userId" VARCHAR(50),
    "entityType" VARCHAR(100),
    "entityId" VARCHAR(50),
    details JSONB,
    metadata JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
-- 5. CREAR TRIGGERS PARA TIMESTAMPS
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
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_residents_timestamp
    BEFORE UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_visitors_timestamp
    BEFORE UPDATE ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_invitations_timestamp
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_frequent_visitors_timestamp
    BEFORE UPDATE ON frequent_visitors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_vehicles_timestamp
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 6. INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar residente de prueba (COMENTADO - descomentar después de hashear password)
-- INSERT INTO residents (
--     id, email, password, "firstName", "lastName", rut, phone, 
--     role, block, "lotNumber", "isActive"
-- ) VALUES (
--     uuid_generate_v4(),
--     'residente@example.com',
--     '$2b$10$YourHashedPasswordHere', -- Debes hashear la contraseña con bcrypt
--     'Juan',
--     'Pérez',
--     '12.345.678-9',
--     '+56912345678',
--     'resident',
--     'A',
--     '101',
--     true
-- );

-- Nota: Para crear la contraseña hasheada, usa:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('password123', 10);

-- ============================================================================
-- 7. CREAR VISTAS ÚTILES
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

-- Vista: Estadísticas de vehículos
CREATE OR REPLACE VIEW vehicle_stats AS
SELECT 
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
    i."visitorName",
    i."visitorRut",
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

-- ============================================================================
-- 8. CREAR FUNCIONES ÚTILES
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
    pending_invitations BIGINT
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
         AND "expirationDate" > CURRENT_TIMESTAMP) AS pending_invitations;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. GRANTS Y PERMISOS
-- ============================================================================

-- Crear rol para la aplicación (opcional)
-- CREATE ROLE gc_app_user WITH LOGIN PASSWORD 'tu_password_seguro';

-- Otorgar permisos
-- GRANT CONNECT ON DATABASE guardian_comunitario TO gc_app_user;
-- GRANT USAGE ON SCHEMA public TO gc_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gc_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gc_app_user;

-- ============================================================================
-- 10. COMENTARIOS EN TABLAS Y COLUMNAS
-- ============================================================================

COMMENT ON TABLE users IS 'Tabla padre para todos los usuarios del sistema';
COMMENT ON TABLE residents IS 'Residentes con información de bloque y lote';
COMMENT ON TABLE visitors IS 'Visitantes con su estado y horarios de entrada/salida';
COMMENT ON TABLE invitations IS 'Invitaciones con código QR para visitantes';
COMMENT ON TABLE frequent_visitors IS 'Visitantes frecuentes registrados por residentes';
COMMENT ON TABLE vehicles IS 'Vehículos registrados de residentes';
COMMENT ON TABLE logs IS 'Registro de auditoría de todas las acciones del sistema';

-- ============================================================================
-- 11. VALIDAR INSTALACIÓN
-- ============================================================================

-- Verificar que todas las tablas fueron creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar que todos los enums fueron creados
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

-- Verificar que todas las funciones fueron creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Base de datos Guardian Comunitario';
    RAISE NOTICE 'Configuración completada exitosamente';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas creadas: 7';
    RAISE NOTICE 'Enums creados: 6';
    RAISE NOTICE 'Vistas creadas: 3';
    RAISE NOTICE 'Funciones creadas: 3';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Siguiente paso: Configurar .env en NestJS';
    RAISE NOTICE '========================================';
END $$;
