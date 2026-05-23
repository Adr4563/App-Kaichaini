require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

const ID_CLASE = '878cb06c-cc5b-43f7-b4d3-614059edd164';

async function verificar() {
  const client = await pool.connect();
  try {
    const clase  = await client.query('SELECT * FROM clase WHERE id = $1', [ID_CLASE]);
    const silabo = await client.query('SELECT * FROM silabo WHERE idclase = $1', [ID_CLASE]);
    const mods   = await client.query(
      'SELECT orden, nombre, bimestre, estado FROM modulo WHERE idclase = $1 ORDER BY bimestre, orden',
      [ID_CLASE]
    );

    console.log('\n=== CLASE ===');
    console.log(clase.rows[0]);

    console.log('\n=== SÍLABO ===');
    console.log(silabo.rows[0]);

    console.log(`\n=== MÓDULOS (${mods.rows.length}) ===`);
    mods.rows.forEach(m => {
      const ic = m.estado === 'disponible' ? '🟢' : '🔒';
      console.log(`  ${ic} [Bim ${m.bimestre}] Sesión ${String(m.orden).padStart(2,'0')}: ${m.nombre}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}
verificar();
