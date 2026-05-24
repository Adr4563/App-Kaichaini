/**
 * Script: Insertar respuestas de demo para mostrar progreso
 * Usuario: Hola@gmail.com
 * Ejecutar con: node scripts/insertar_progreso_demo.js
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

const CORREO = 'Hola@gmail.com';

async function run() {
  const client = await pool.connect();
  try {
    // 1. Buscar el usuario
    const { rows: usuarios } = await client.query(
      `SELECT id, nombre FROM usuario WHERE LOWER(correo) = LOWER($1) LIMIT 1`,
      [CORREO]
    );

    if (!usuarios.length) {
      console.error(`❌ No se encontró el usuario con correo: ${CORREO}`);
      return;
    }

    const usuario = usuarios[0];
    console.log(`\n👤 Usuario encontrado: ${usuario.nombre} (${usuario.id})`);

    // 2. Obtener ejercicios disponibles (con su respuesta correcta)
    const { rows: ejercicios } = await client.query(
      `SELECT id, enunciado, tipo, respuestacorrecta
       FROM ejercicio
       ORDER BY id
       LIMIT 12`
    );

    if (!ejercicios.length) {
      console.error('❌ No hay ejercicios en la BD. Ejecuta primero insertar_ejercicios.js');
      return;
    }

    console.log(`\n📋 Ejercicios disponibles: ${ejercicios.length}`);

    // 3. Verificar si ya tiene respuestas para no duplicar
    const { rows: existentes } = await client.query(
      `SELECT COUNT(*) AS total FROM respuesta WHERE idestudiante = $1`,
      [usuario.id]
    );
    const yaExisten = parseInt(existentes[0].total);
    if (yaExisten > 0) {
      console.log(`⚠️  Ya tiene ${yaExisten} respuesta(s). Eliminando para reinsertar...`);
      await client.query(`DELETE FROM respuesta WHERE idestudiante = $1`, [usuario.id]);
    }

    // 4. Insertar respuestas — mix de correctas e incorrectas
    // Patrón: correcta, correcta, incorrecta, correcta, incorrecta, correcta...
    const patron = [true, true, false, true, false, true, true, false, true, true, false, true];

    await client.query('BEGIN');

    let correctas = 0;
    let incorrectas = 0;

    for (let i = 0; i < ejercicios.length; i++) {
      const ej = ejercicios[i];
      const esCorrecta = patron[i % patron.length];

      // Si es correcta → usar respuestacorrecta; si no → usar respuesta inventada
      const respuestaDada = esCorrecta
        ? ej.respuestacorrecta
        : 'Respuesta incorrecta de prueba';

      await client.query(
        `INSERT INTO respuesta (id, idestudiante, idejercicio, respuesta, escorrecta)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), usuario.id, ej.id, respuestaDada, esCorrecta]
      );

      const icono = esCorrecta ? '✅' : '❌';
      console.log(`   ${icono} [${ej.tipo}] ${ej.enunciado.substring(0, 50)}...`);
      esCorrecta ? correctas++ : incorrectas++;
    }

    await client.query('COMMIT');

    const total = correctas + incorrectas;
    const porcentaje = Math.round((correctas / total) * 100);

    console.log(`\n✅ ¡Listo! Respuestas insertadas para ${CORREO}:`);
    console.log(`   Total    : ${total}`);
    console.log(`   Correctas: ${correctas}`);
    console.log(`   Errores  : ${incorrectas}`);
    console.log(`   Aciertos : ${porcentaje}%`);
    console.log('\n📱 Abre la app e ingresa con ese usuario para ver el progreso.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error:', err.message);
    if (err.detail) console.error('Detalle:', err.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
