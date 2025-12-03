-- Test data for Guardian Comunitario

-- Insert test residents
INSERT INTO residents (email, password, "firstName", "lastName", rut, phone, block, "lotNumber")
VALUES 
  ('juan.perez@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmno', 'Juan', 'Pérez', '12.345.678-9', '+56912345678', 'A', '101'),
  ('maria.gonzalez@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmno', 'María', 'González', '98.765.432-1', '+56987654321', 'B', '202'),
  ('pedro.rodriguez@test.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmno', 'Pedro', 'Rodríguez', '11.222.333-4', '+56911222333', 'C', '303')
ON CONFLICT (email) DO NOTHING;

SELECT 'Residents inserted successfully' AS status;
SELECT id, rut, email, "firstName", "lastName", block, "lotNumber" FROM residents;
