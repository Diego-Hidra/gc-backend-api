const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'guardian_comunitario',
  user: 'postgres',
  password: 'password123',
});

async function checkUserTypeColumn() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Verificar si existe la columna user_type
    const result = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'user_type'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Columna user_type EXISTE:');
      console.table(result.rows);
    } else {
      console.log('❌ Columna user_type NO EXISTE en la tabla users');
      console.log('\nColumnas actuales:');
      const allColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      console.table(allColumns.rows);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserTypeColumn();
