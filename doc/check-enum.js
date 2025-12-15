const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'guardian_comunitario',
    user: 'postgres',
    password: 'password123'
});

async function checkEnum() {
    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL\n');

        const result = await client.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vehicle_type') 
            ORDER BY enumsortorder
        `);

        console.log('Valores actuales del enum vehicle_type:');
        result.rows.forEach(row => {
            console.log('  -', row.enumlabel);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkEnum();
