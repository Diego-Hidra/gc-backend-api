# Script para detener el servicio de PostgreSQL
# Uso: .\kill-postgres.ps1

Write-Host "Deteniendo servicio de PostgreSQL..." -ForegroundColor Cyan

try {
    # Buscar el servicio de PostgreSQL
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq 'Running') {
            Write-Host "Deteniendo servicio postgresql-x64-18..." -ForegroundColor Yellow
            Stop-Service -Name "postgresql-x64-18" -Force
            Write-Host "Servicio de PostgreSQL detenido exitosamente" -ForegroundColor Green
        } else {
            Write-Host "El servicio ya esta detenido" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No se encontro el servicio postgresql-x64-18" -ForegroundColor Red
    }
} catch {
    Write-Host "Error al detener el servicio. Intentando con procesos..." -ForegroundColor Yellow
    
    # Plan B: matar procesos directamente
    $postgresProcesses = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    
    if ($postgresProcesses) {
        Write-Host "Matando $($postgresProcesses.Count) procesos de PostgreSQL..." -ForegroundColor Yellow
        $postgresProcesses | Stop-Process -Force
        Write-Host "Procesos de PostgreSQL detenidos" -ForegroundColor Green
    } else {
        Write-Host "No hay procesos de PostgreSQL corriendo" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Para reiniciar PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Start-Service postgresql-x64-18" -ForegroundColor White
