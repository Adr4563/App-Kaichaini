/**
 * Script: Insertar material académico
 * Ejecutar con: node scripts/insertar_material.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

const ID_CLASE = '878cb06c-cc5b-43f7-b4d3-614059edd164';

async function insertar() {
  const client = await pool.connect();
  try {
    // Obtener todos los módulos para asignar material por sesión
    const { rows: modulos } = await client.query(
      `SELECT id, nombre, orden FROM modulo WHERE idclase = $1 ORDER BY orden`,
      [ID_CLASE]
    );

    console.log('\n📦 Módulos disponibles:');
    modulos.forEach(m => console.log(`   [${m.orden}] ${m.nombre} → ${m.id}`));

    // Material a insertar: cada archivo con su módulo correspondiente
    // El PDF "Unidad 1: Números y operaciones" cubre toda la unidad
    // Lo registramos en los módulos más relevantes

    const materiales = [
      // Presentación general de la unidad → Sesión 1
      {
        idmodulo: modulos.find(m => m.orden === 1)?.id,
        nombre:   'Unidad 1: Números y operaciones (Presentación)',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
      // Números reales y racionales → Sesión 2 (Pertenencia e inclusión)
      {
        idmodulo: modulos.find(m => m.orden === 2)?.id,
        nombre:   'Números Naturales, Enteros y Racionales',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
      // Números irracionales → Sesión 3 (Clasificación de conjuntos)
      {
        idmodulo: modulos.find(m => m.orden === 3)?.id,
        nombre:   'Números Irracionales y Números Reales',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
      // Propiedades de números reales → Sesión 4 (Conjuntos especiales)
      {
        idmodulo: modulos.find(m => m.orden === 4)?.id,
        nombre:   'Propiedades de los Números Reales',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
      // Raíces enésimas → Sesión 5 (Unión de conjuntos)
      {
        idmodulo: modulos.find(m => m.orden === 5)?.id,
        nombre:   'Raíces Enésimas y Propiedades',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
      // Logaritmos → Sesión 6
      {
        idmodulo: modulos.find(m => m.orden === 6)?.id,
        nombre:   'Logaritmos: Definición y Propiedades',
        url:      'https://storage.kaichaini.com/material/unidad1-numeros-operaciones.pdf',
        tipo:     'pdf',
      },
    ];

    await client.query('BEGIN');

    console.log('\n📚 Insertando material académico...');
    for (const mat of materiales) {
      if (!mat.idmodulo) { console.log(`   ⚠️  Módulo no encontrado para: ${mat.nombre}`); continue; }

      await client.query(
        `INSERT INTO material (id, idclase, idmodulo, nombre, archivourl, tipo)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), ID_CLASE, mat.idmodulo, mat.nombre, mat.url, mat.tipo]
      );
      console.log(`   ✅ ${mat.nombre}`);
    }

    await client.query('COMMIT');

    // Verificar
    const { rows: total } = await client.query(
      `SELECT m.nombre as sesion, mat.nombre as material, mat.tipo
       FROM material mat
       JOIN modulo m ON m.id = mat.idmodulo
       WHERE mat.idclase = $1
       ORDER BY m.orden`, [ID_CLASE]
    );

    console.log(`\n🎓 Material insertado (${total.length} archivos):`);
    total.forEach((r, i) =>
      console.log(`   ${i+1}. [${r.tipo.toUpperCase()}] ${r.material}\n      → Sesión: ${r.sesion}`)
    );

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertar();
