require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

const ID_SILABO = '183929f9-91fb-4d6b-b763-3b8d703f5c1f';

// Unidades temáticas reales de la clase Matemática 4° Grado
const CONTENIDO = `Unidad 1: Conjuntos y sus operaciones
Unidad 2: Números naturales y estadística básica
Unidad 3: Multiplicación, división y geometría
Unidad 4: Potenciación, radicación y representación de datos
Unidad 5: Teoría de números y medición
Unidad 6: Fracciones y ecuaciones`;

pool.query(`UPDATE silabo SET contenido = $1 WHERE id = $2`, [CONTENIDO, ID_SILABO])
  .then(r => { console.log('✅ Contenido actualizado:', r.rowCount, 'fila'); pool.end(); })
  .catch(e => { console.error('❌', e.message); pool.end(); });
