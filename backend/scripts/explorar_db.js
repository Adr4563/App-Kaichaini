/**
 * Script de exploración de la base de datos RDS
 * Ejecutar con: node scripts/explorar_db.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

async function explorar() {
  const client = await pool.connect();
  try {
    console.log('✅ Conectado a la base de datos\n');

    // 1. Listar todas las tablas
    console.log('=== TABLAS EN SCHEMA PUBLIC ===');
    const tablas = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    tablas.rows.forEach(r => console.log(' -', r.table_name));

    // 2. Obtener columnas de cada tabla
    console.log('\n=== COLUMNAS POR TABLA ===');
    for (const { table_name } of tablas.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table_name]);
      console.log(`\n[${table_name}]`);
      cols.rows.forEach(c => {
        const tipo = c.character_maximum_length ? `${c.data_type}(${c.character_maximum_length})` : c.data_type;
        console.log(`  ${c.column_name}: ${tipo} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''} ${c.column_default ? `DEFAULT ${c.column_default}` : ''}`);
      });
    }

    // 3. Ver datos existentes en tablas clave
    const tablasClave = ['clase', 'CLASE', 'usuario', 'USUARIO', 'modulo', 'MODULO', 'silabo', 'SILABO'];
    console.log('\n=== DATOS EXISTENTES ===');
    for (const tabla of tablas.rows.map(r => r.table_name)) {
      try {
        const data = await client.query(`SELECT * FROM "${tabla}" LIMIT 5`);
        if (data.rows.length > 0) {
          console.log(`\n[${tabla}] (${data.rows.length} filas mostradas):`);
          console.log(JSON.stringify(data.rows, null, 2));
        } else {
          console.log(`\n[${tabla}]: vacía`);
        }
      } catch (e) {
        console.log(`\n[${tabla}]: error - ${e.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

explorar();
