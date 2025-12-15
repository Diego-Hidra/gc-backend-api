# ============================================================================
# Script PowerShell para ejecutar database-setup.sql en PostgreSQL
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Guardian Comunitario - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$scriptPath = ".\database-setup.sql"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5432"

# Verificar que psql existe
if (-not (Test-Path $psqlPath)) {
    Write-Host "ERROR: No se encontró psql.exe" -ForegroundColor Red
    Write-Host "Ruta buscada: $psqlPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifica la instalación de PostgreSQL" -ForegroundColor Yellow
    pause
    exit 1
}

# Verificar que el script SQL existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: No se encontró database-setup.sql" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde la carpeta gc-backend-api" -ForegroundColor Yellow
    pause
    exit 1
}

# Verificar si PostgreSQL está corriendo
Write-Host "Verificando servicio PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✓ PostgreSQL está corriendo" -ForegroundColor Green
    } else {
        Write-Host "⚠ PostgreSQL está instalado pero no está corriendo" -ForegroundColor Yellow
        Write-Host "Intentando iniciar el servicio..." -ForegroundColor Yellow
        try {
            Start-Service $pgService.Name
            Write-Host "✓ Servicio iniciado correctamente" -ForegroundColor Green
        } catch {
            Write-Host "✗ No se pudo iniciar el servicio automáticamente" -ForegroundColor Red
            Write-Host "Inicia el servicio manualmente desde 'Servicios' de Windows" -ForegroundColor Yellow
            pause
            exit 1
        }
    }
} else {
    Write-Host "⚠ No se pudo verificar el estado del servicio PostgreSQL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Conectando a PostgreSQL..." -ForegroundColor Cyan
Write-Host "Usuario: $dbUser" -ForegroundColor Gray
Write-Host "Host: $dbHost" -ForegroundColor Gray
Write-Host "Puerto: $dbPort" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTA: Se te pedirá la contraseña del usuario postgres" -ForegroundColor Yellow
Write-Host ""

# Ejecutar script SQL
& $psqlPath -U $dbUser -h $dbHost -p $dbPort -f $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Base de datos configurada exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Siguiente paso:" -ForegroundColor Cyan
    Write-Host "1. Configurar archivo .env" -ForegroundColor White
    Write-Host "2. Ejecutar: npm run start:dev" -ForegroundColor White
    Write-Host "3. Importar colección en Postman" -ForegroundColor White
    Write-Host ""
    Write-Host "Tablas creadas:" -ForegroundColor Cyan
    Write-Host "  - users, residents, visitors, invitations" -ForegroundColor Gray
    Write-Host "  - frequent_visitors, vehicles, logs" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ ERROR: No se pudo ejecutar el script" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles causas:" -ForegroundColor Yellow
    Write-Host "1. Contraseña incorrecta" -ForegroundColor White
    Write-Host "2. PostgreSQL no está corriendo" -ForegroundColor White
    Write-Host "3. Puerto 5432 no disponible" -ForegroundColor White
    Write-Host "4. Usuario 'postgres' no tiene permisos" -ForegroundColor White
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "• Verifica la contraseña en pgAdmin" -ForegroundColor White
    Write-Host "• Abre 'Servicios' y verifica 'postgresql-x64-18'" -ForegroundColor White
    Write-Host "• Revisa el archivo pg_hba.conf para autenticacion" -ForegroundColor White
    Write-Host ""
}

pause
