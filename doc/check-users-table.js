const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'guardian_comunitario',
    user: 'postgres',
    password: 'password123'
});

async function checkUsersTable() {
    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL\n');

        const result = await client.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('Estructura de la tabla users:');
        console.table(result.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkUsersTable();
