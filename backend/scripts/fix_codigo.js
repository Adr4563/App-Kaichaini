require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

pool.query(
  `UPDATE clase SET "codigoUnico" = 'MAT4G1' WHERE id = '878cb06c-cc5b-43f7-b4d3-614059edd164' RETURNING nombre, "codigoUnico"`)
  .then(r => { console.log('✅ Código actualizado:', r.rows[0]); pool.end(); })
  .catch(e => { console.error('❌', e.message); pool.end(); });
