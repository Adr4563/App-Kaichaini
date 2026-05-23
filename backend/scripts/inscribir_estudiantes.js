/**
 * Script: Inscribir estudiantes en Matemática 4° Grado
 * Ejecutar con: node scripts/inscribir_estudiantes.js
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

async function inscribir() {
  const client = await pool.connect();
  try {
    // Obtener todos los estudiantes registrados
    const { rows: estudiantes } = await client.query(
      `SELECT id, nombre, correo FROM usuario WHERE rol = 'Estudiante' ORDER BY fecharegistro`
    );

    console.log(`\n👥 Estudiantes encontrados: ${estudiantes.length}`);
    estudiantes.forEach((e, i) => console.log(`   ${i+1}. ${e.nombre} (${e.correo})`));

    // Verificar cuáles ya están inscritos (evitar duplicados)
    const { rows: yaInscritos } = await client.query(
      `SELECT "idEstudiante" FROM estudiante_clase WHERE "idClase" = $1`, [ID_CLASE]
    );
    const yaInscritosSet = new Set(yaInscritos.map(r => r.idEstudiante));

    const porInscribir = estudiantes.filter(e => !yaInscritosSet.has(e.id));
    console.log(`\n📋 Por inscribir (sin duplicados): ${porInscribir.length}`);

    if (porInscribir.length === 0) {
      console.log('   ✅ Todos ya están inscritos.');
      return;
    }

    await client.query('BEGIN');

    for (const est of porInscribir) {
      // Insertar en estudiante_clase
      await client.query(
        `INSERT INTO estudiante_clase (id, "idEstudiante", "idClase") VALUES ($1, $2, $3)`,
        [uuidv4(), est.id, ID_CLASE]
      );

      // Crear registro XP si no existe
      const xpExiste = await client.query(
        `SELECT id FROM xp WHERE "idEstudiante" = $1`, [est.id]
      );
      if (xpExiste.rows.length === 0) {
        await client.query(
          `INSERT INTO xp (id, "idEstudiante", "puntosTotal") VALUES ($1, $2, 0)`,
          [uuidv4(), est.id]
        );
        console.log(`   ✅ ${est.nombre} — inscrito + XP creado`);
      } else {
        console.log(`   ✅ ${est.nombre} — inscrito (XP ya existía)`);
      }
    }

    await client.query('COMMIT');

    // Verificación final
    const { rows: total } = await client.query(
      `SELECT u.nombre, u.correo, ec."fechaIngreso"
       FROM estudiante_clase ec
       JOIN usuario u ON u.id = ec."idEstudiante"
       WHERE ec."idClase" = $1
       ORDER BY ec."fechaIngreso"`, [ID_CLASE]
    );

    console.log(`\n🎓 Clase "Matemática 4° Grado" — ${total.length} estudiante(s) inscritos:`);
    total.forEach((e, i) => {
      const fecha = new Date(e.fechaIngreso).toLocaleDateString('es-PE');
      console.log(`   ${i+1}. ${e.nombre} (${e.correo}) — desde ${fecha}`);
    });
    console.log('\n✅ ¡Listo!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error — rollback:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inscribir();
