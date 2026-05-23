require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

async function check() {
  const { rows } = await pool.query(
    `SELECT nombre, correo, "tokenJWT" FROM usuario WHERE "tokenJWT" IS NOT NULL`
  );
  console.log(`\nFecha actual: ${new Date().toISOString()}\n`);
  for (const u of rows) {
    try {
      const decoded = jwt.verify(u.tokenJWT, process.env.JWT_SECRET);
      const exp = new Date(decoded.exp * 1000);
      console.log(`✅ ${u.nombre} (${u.correo}) — expira: ${exp.toISOString()}`);
    } catch (e) {
      const decoded = jwt.decode(u.tokenJWT);
      const exp = decoded ? new Date(decoded.exp * 1000).toISOString() : 'N/A';
      console.log(`❌ ${u.nombre} (${u.correo}) — EXPIRADO el: ${exp} → ${e.message}`);
    }
  }
  await pool.end();
}
check();
