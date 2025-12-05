const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'guardian_comunitario',
    user: 'postgres',
    password: 'password123'
});

async function checkLogsTable() {
    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL\n');

        // Verificar estructura de la tabla logs
        const result = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'logs'
            ORDER BY ordinal_position;
        `);

        console.log('Estructura de la tabla logs:');
        console.table(result.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkLogsTable();
