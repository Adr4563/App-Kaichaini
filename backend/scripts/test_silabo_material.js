require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

const ID_CLASE = '878cb06c-cc5b-43f7-b4d3-614059edd164';

async function test() {
  const client = await pool.connect();
  try {
    // Test silabo query (igual que el repositorio corregido)
    const { rows: silabo } = await client.query(`
      SELECT id,
             idclase      AS "idClase",
             archivourl   AS "archivoUrl",
             fechasubida  AS "fechaSubida"
      FROM silabo WHERE idclase = $1
    `, [ID_CLASE]);

    console.log('\n✅ Query sílabo:');
    console.log(silabo.length ? silabo[0] : '⚠️  Sin resultados');

    // Test material query
    const { rows: material } = await client.query(`
      SELECT id, idclase AS "idClase", idmodulo AS "idModulo",
             nombre, archivourl AS "archivoUrl", tipo
      FROM material WHERE idclase = $1
    `, [ID_CLASE]);

    console.log('\n✅ Query material:');
    console.log(material.length ? `${material.length} archivos` : '⚠️  Tabla material vacía (esperado — aún no hay archivos subidos)');

  } finally {
    client.release();
    await pool.end();
  }
}
test();
