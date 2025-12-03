const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'guardian_comunitario',
    user: 'postgres',
    password: 'password123'
});

async function fixUserIdColumn() {
    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL\n');

        console.log('🔄 Modificando columna userId de VARCHAR a UUID...');
        
        // Alterar el tipo de dato de la columna userId
        await client.query(`
            ALTER TABLE logs 
            ALTER COLUMN "userId" TYPE uuid 
            USING CASE 
                WHEN "userId" IS NULL THEN NULL
                WHEN "userId" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN "userId"::uuid
                ELSE NULL
            END;
        `);

        console.log('✅ Columna userId convertida a UUID exitosamente\n');

        // Verificar el cambio
        const result = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'logs' AND column_name = 'userId';
        `);

        console.log('Verificación de la columna userId:');
        console.table(result.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Detalles:', error);
    } finally {
        await client.end();
    }
}

fixUserIdColumn();
