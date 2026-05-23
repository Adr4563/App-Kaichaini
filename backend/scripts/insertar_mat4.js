/**
 * Script de inserción: Matemática 4° Grado
 * ==========================================
 * Crea:
 *   1. Clase "Matemática 4° Grado"
 *   2. Registro de sílabo (URL placeholder — reemplazar con URL real al subir el PDF)
 *   3. 11 módulos (sesiones) de la Unidad 1 — Bimestre 1
 *
 * Ejecutar con: node scripts/insertar_mat4.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

// ─── IDs ────────────────────────────────────────────────────────────────────
const ID_DOCENTE_DEMO = '12117833-5681-405a-bf07-5152bae974fd';
const ID_NUEVA_CLASE  = uuidv4();
const ID_SILABO       = uuidv4();

// ─── DATOS ──────────────────────────────────────────────────────────────────

const CLASE = {
  id:          ID_NUEVA_CLASE,
  nombre:      'Matemática 4° Grado',
  codigoUnico: 'MAT4G',
  curso:       'Matemática',
  idDocente:   ID_DOCENTE_DEMO,
};

// URL placeholder: el docente debe subir el PDF real y actualizar esta URL
const SILABO_URL = 'https://storage.kaichaini.com/silabos/mat4-silabo-2024.pdf';

// 11 sesiones — Unidad 1: "Buscamos alternativas para una adecuada alimentación"
// Bimestre 1, orden 1-11
const MODULOS = [
  { orden: 1,  nombre: 'Noción de conjunto',                     bimestre: 1, estado: 'disponible' },
  { orden: 2,  nombre: 'Pertenencia e inclusión de conjuntos',   bimestre: 1, estado: 'bloqueado'  },
  { orden: 3,  nombre: 'Clasificación de conjuntos',             bimestre: 1, estado: 'bloqueado'  },
  { orden: 4,  nombre: 'Conjuntos especiales',                   bimestre: 1, estado: 'bloqueado'  },
  { orden: 5,  nombre: 'La unión de conjuntos',                  bimestre: 1, estado: 'bloqueado'  },
  { orden: 6,  nombre: 'La intersección de conjuntos',           bimestre: 1, estado: 'bloqueado'  },
  { orden: 7,  nombre: 'La diferencia de conjuntos',             bimestre: 1, estado: 'bloqueado'  },
  { orden: 8,  nombre: 'Patrones de repetición',                 bimestre: 1, estado: 'bloqueado'  },
  { orden: 9,  nombre: 'Elementos básicos de geometría',         bimestre: 1, estado: 'bloqueado'  },
  { orden: 10, nombre: 'Ángulos',                                bimestre: 1, estado: 'bloqueado'  },
  { orden: 11, nombre: 'Introducción a la estadística',          bimestre: 1, estado: 'bloqueado'  },
];

// ─── INSERCIÓN ───────────────────────────────────────────────────────────────

async function insertar() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar clase
    console.log('\n📚 Insertando clase...');
    await client.query(
      `INSERT INTO clase (id, nombre, "codigoUnico", curso, "idDocente")
       VALUES ($1, $2, $3, $4, $5)`,
      [CLASE.id, CLASE.nombre, CLASE.codigoUnico, CLASE.curso, CLASE.idDocente]
    );
    console.log(`   ✅ Clase creada → id: ${CLASE.id}`);
    console.log(`      Nombre: ${CLASE.nombre}`);
    console.log(`      Código único: ${CLASE.codigoUnico}`);

    // 2. Insertar sílabo
    console.log('\n📄 Insertando sílabo...');
    await client.query(
      `INSERT INTO silabo (id, idclase, archivourl)
       VALUES ($1, $2, $3)`,
      [ID_SILABO, ID_NUEVA_CLASE, SILABO_URL]
    );
    console.log(`   ✅ Sílabo creado → id: ${ID_SILABO}`);
    console.log(`      URL: ${SILABO_URL}`);
    console.log('   ⚠️  Recuerda actualizar la URL con el archivo PDF real del sílabo.');

    // 3. Insertar los 11 módulos
    console.log('\n🗂️  Insertando 11 módulos (Unidad 1 — Bimestre 1)...');
    for (const mod of MODULOS) {
      const idMod = uuidv4();
      await client.query(
        `INSERT INTO modulo (id, idclase, nombre, orden, bimestre, estado)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [idMod, ID_NUEVA_CLASE, mod.nombre, mod.orden, mod.bimestre, mod.estado]
      );
      const icono = mod.estado === 'disponible' ? '🟢' : '🔒';
      console.log(`   ${icono} Sesión ${String(mod.orden).padStart(2,'0')}: ${mod.nombre}`);
    }

    await client.query('COMMIT');

    console.log('\n✅ ¡Inserción completada con éxito!');
    console.log('─'.repeat(60));
    console.log('RESUMEN:');
    console.log(`  Clase ID    : ${ID_NUEVA_CLASE}`);
    console.log(`  Sílabo ID   : ${ID_SILABO}`);
    console.log(`  Módulos     : ${MODULOS.length} sesiones insertadas`);
    console.log('─'.repeat(60));
    console.log('\n📋 Guarda este ID de clase para el frontend:');
    console.log(`   "${ID_NUEVA_CLASE}"`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error — se revirtió la transacción:');
    console.error(err.message);
    if (err.detail) console.error('Detalle:', err.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

insertar();
