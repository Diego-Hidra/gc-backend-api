@echo off
REM ============================================================================
REM Script para ejecutar database-setup.sql en PostgreSQL
REM ============================================================================

echo ========================================
echo Guardian Comunitario - Database Setup
echo ========================================
echo.

REM Ruta al psql
set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

REM Verificar que psql existe
if not exist %PSQL_PATH% (
    echo ERROR: No se encontro psql.exe
    echo Verifica la instalacion de PostgreSQL
    pause
    exit /b 1
)

echo Conectando a PostgreSQL...
echo Usuario: postgres
echo Host: localhost
echo Puerto: 5432
echo.
echo NOTA: Se te pedira la contrasena del usuario postgres
echo.

REM Ejecutar script SQL
%PSQL_PATH% -U postgres -h localhost -p 5432 -f database-setup.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Base de datos configurada exitosamente!
    echo ========================================
    echo.
    echo Siguiente paso:
    echo 1. Configurar archivo .env
    echo 2. Ejecutar: npm run start:dev
    echo 3. Importar coleccion en Postman
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: No se pudo ejecutar el script
    echo ========================================
    echo.
    echo Posibles causas:
    echo 1. Contrasena incorrecta
    echo 2. PostgreSQL no esta corriendo
    echo 3. Puerto 5432 no disponible
    echo.
    echo Para verificar PostgreSQL:
    echo - Abre "Servicios" de Windows
    echo - Busca "postgresql-x64-18"
    echo - Verifica que este "En ejecucion"
    echo.
)

pause
