const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password123',
  database: 'guardian_comunitario'
});

async function addColumns() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos\n');
    
    // Agregar columnas faltantes
    const queries = [
      `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS "visitorPhone" VARCHAR`,
      `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS "visitorEmail" VARCHAR`,
      `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS "notes" TEXT`,
      `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS "hasVehicle" BOOLEAN DEFAULT false`,
      `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS "vehicleInfo" JSONB`
    ];
    
    for (const query of queries) {
      console.log(`Ejecutando: ${query}`);
      await client.query(query);
      console.log('✓ Completado\n');
    }
    
    // Verificar columnas finales
    console.log('=== COLUMNAS FINALES ===\n');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'invitations' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${row.is_nullable}`);
    });
    
    await client.end();
    console.log('\n✓ Columnas agregadas correctamente');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addColumns();
