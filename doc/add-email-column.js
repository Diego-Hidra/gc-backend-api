const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password123',
  database: 'guardian_comunitario'
});

async function addColumn() {
  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');
    
    const result = await client.query(`
      ALTER TABLE frequent_visitors 
      ADD COLUMN IF NOT EXISTS email VARCHAR;
    `);
    
    console.log('✅ Columna "email" agregada exitosamente a frequent_visitors');
    
    // Verificar
    const check = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'frequent_visitors' 
      AND column_name = 'email';
    `);
    
    if (check.rows.length > 0) {
      console.log('✅ Verificación: Columna existe ->', check.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

addColumn();
