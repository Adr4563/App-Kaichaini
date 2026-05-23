/**
 * Script: Insertar ejercicios para Matemática 4° Grado
 * Unidad 1 — 11 sesiones, 4 ejercicios por sesión
 * Tipos: seleccion_multiple | banco_palabras | clic_imagen
 *
 * Ejecutar con: node scripts/insertar_ejercicios.js
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

// Ejercicios por sesión (se mapean por orden del módulo)
// 4 ejercicios por módulo, variando tipos
const EJERCICIOS_POR_SESION = {

  // ─── Sesión 1: Noción de conjunto ─────────────────────────────────────────
  1: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es un conjunto?',
      respuestacorrecta: 'Una colección bien definida de objetos o elementos',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál de las siguientes opciones forma un conjunto bien definido?',
      respuestacorrecta: 'Los números pares entre 1 y 10',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Completa: Un conjunto es una _____ de elementos con una característica _____ en común.',
      respuestacorrecta: 'colección|común',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuántos elementos tiene el conjunto A = {manzana, pera, uva, naranja}?',
      respuestacorrecta: '4',
    },
  ],

  // ─── Sesión 2: Pertenencia e inclusión de conjuntos ───────────────────────
  2: [
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3, 4, 5}, ¿el número 3 pertenece al conjunto A?',
      respuestacorrecta: 'Sí, 3 ∈ A',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si B = {a, e, i, o, u}, ¿la letra "b" pertenece a B?',
      respuestacorrecta: 'No, b ∉ B',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'El símbolo ∈ significa que un elemento _____ al conjunto.',
      respuestacorrecta: 'pertenece',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3} y B = {1, 2, 3, 4, 5}, ¿qué relación existe entre A y B?',
      respuestacorrecta: 'A está incluido en B (A ⊆ B)',
    },
  ],

  // ─── Sesión 3: Clasificación de conjuntos ─────────────────────────────────
  3: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cómo se llama un conjunto que no tiene ningún elemento?',
      respuestacorrecta: 'Conjunto vacío',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál es el símbolo del conjunto vacío?',
      respuestacorrecta: '∅ o {}',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Un conjunto con un número limitado de elementos se llama conjunto _____.',
      respuestacorrecta: 'finito',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál de estos es un conjunto infinito?',
      respuestacorrecta: 'El conjunto de todos los números naturales',
    },
  ],

  // ─── Sesión 4: Conjuntos especiales ───────────────────────────────────────
  4: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cómo se llama el conjunto que contiene todos los elementos posibles en un problema?',
      respuestacorrecta: 'Conjunto universal',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué símbolo representa al conjunto universal?',
      respuestacorrecta: 'U',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Dos conjuntos son _____ si tienen exactamente los mismos elementos.',
      respuestacorrecta: 'iguales',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3} y B = {3, 2, 1}, ¿qué tipo de conjuntos son?',
      respuestacorrecta: 'Conjuntos iguales',
    },
  ],

  // ─── Sesión 5: La unión de conjuntos ──────────────────────────────────────
  5: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es la unión de dos conjuntos A y B?',
      respuestacorrecta: 'El conjunto de todos los elementos que pertenecen a A o a B',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3} y B = {3, 4, 5}, ¿cuál es A ∪ B?',
      respuestacorrecta: '{1, 2, 3, 4, 5}',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'El símbolo de la unión de conjuntos es _____.',
      respuestacorrecta: '∪',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {a, b, c} y B = {d, e}, ¿cuántos elementos tiene A ∪ B?',
      respuestacorrecta: '5',
    },
  ],

  // ─── Sesión 6: La intersección de conjuntos ───────────────────────────────
  6: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es la intersección de dos conjuntos?',
      respuestacorrecta: 'El conjunto de elementos que pertenecen a ambos conjuntos a la vez',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3, 4} y B = {3, 4, 5, 6}, ¿cuál es A ∩ B?',
      respuestacorrecta: '{3, 4}',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'El símbolo de la intersección de conjuntos es _____.',
      respuestacorrecta: '∩',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2} y B = {3, 4}, ¿cuántos elementos tiene A ∩ B?',
      respuestacorrecta: '0, la intersección es el conjunto vacío',
    },
  ],

  // ─── Sesión 7: La diferencia de conjuntos ─────────────────────────────────
  7: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es la diferencia A - B?',
      respuestacorrecta: 'Los elementos que están en A pero no en B',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {1, 2, 3, 4} y B = {3, 4, 5}, ¿cuál es A - B?',
      respuestacorrecta: '{1, 2}',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'En la diferencia A − B, los elementos de B se _____ del conjunto A.',
      respuestacorrecta: 'eliminan',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si A = {a, b, c} y B = {b, c, d}, ¿cuál es B - A?',
      respuestacorrecta: '{d}',
    },
  ],

  // ─── Sesión 8: Patrones de repetición ─────────────────────────────────────
  8: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál es el siguiente elemento en el patrón: 2, 4, 6, 8, ___?',
      respuestacorrecta: '10',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál es el siguiente en el patrón: △, ○, △, ○, ___?',
      respuestacorrecta: '△',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Un patrón de repetición es una secuencia que se _____ de forma regular.',
      respuestacorrecta: 'repite',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuál es el siguiente en: rojo, azul, verde, rojo, azul, ___?',
      respuestacorrecta: 'verde',
    },
  ],

  // ─── Sesión 9: Elementos básicos de geometría ─────────────────────────────
  9: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es un punto en geometría?',
      respuestacorrecta: 'Una posición en el espacio sin dimensión',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuántos puntos se necesitan para definir una recta?',
      respuestacorrecta: '2',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Una _____ es una sucesión infinita de puntos en una misma dirección.',
      respuestacorrecta: 'recta',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué diferencia hay entre una recta y un segmento?',
      respuestacorrecta: 'El segmento tiene dos extremos y longitud definida; la recta es infinita',
    },
  ],

  // ─── Sesión 10: Ángulos ───────────────────────────────────────────────────
  10: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cómo se llama un ángulo que mide exactamente 90°?',
      respuestacorrecta: 'Ángulo recto',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cómo se llama un ángulo que mide menos de 90°?',
      respuestacorrecta: 'Ángulo agudo',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Un ángulo que mide más de 90° y menos de 180° se llama ángulo _____.',
      respuestacorrecta: 'obtuso',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cuántos grados mide un ángulo llano?',
      respuestacorrecta: '180°',
    },
  ],

  // ─── Sesión 11: Introducción a la estadística ─────────────────────────────
  11: [
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Qué es la estadística?',
      respuestacorrecta: 'La rama de las matemáticas que recopila, organiza y analiza datos',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: '¿Cómo se llama la forma de organizar datos en filas y columnas?',
      respuestacorrecta: 'Tabla de datos o tabla de frecuencias',
    },
    {
      tipo: 'banco_palabras',
      enunciado: 'Un _____ de barras sirve para comparar cantidades de forma visual.',
      respuestacorrecta: 'gráfico',
    },
    {
      tipo: 'seleccion_multiple',
      enunciado: 'Si en un salón hay 5 alumnos con nota 15 y 3 con nota 18, ¿cuál es la moda?',
      respuestacorrecta: '15',
    },
  ],
};

async function insertarEjercicios() {
  const client = await pool.connect();
  try {
    // Obtener los módulos de la clase con su orden
    const { rows: modulos } = await client.query(
      `SELECT id, nombre, orden FROM modulo WHERE idclase = $1 ORDER BY bimestre, orden`,
      [ID_CLASE]
    );

    console.log(`\n📦 Módulos encontrados: ${modulos.length}`);

    await client.query('BEGIN');

    let totalInsertados = 0;

    for (const mod of modulos) {
      const ejercicios = EJERCICIOS_POR_SESION[mod.orden];
      if (!ejercicios) {
        console.log(`   ⚠️  Sin ejercicios definidos para sesión ${mod.orden}`);
        continue;
      }

      console.log(`\n📝 Sesión ${String(mod.orden).padStart(2,'0')}: ${mod.nombre} — ${ejercicios.length} ejercicios`);

      for (const ej of ejercicios) {
        await client.query(
          `INSERT INTO ejercicio (id, idmodulo, tipo, enunciado, respuestacorrecta)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), mod.id, ej.tipo, ej.enunciado, ej.respuestacorrecta]
        );
        const tipoIcon = ej.tipo === 'seleccion_multiple' ? '🔵'
                       : ej.tipo === 'banco_palabras'     ? '🟡'
                       :                                    '🟠';
        console.log(`      ${tipoIcon} [${ej.tipo}] ${ej.enunciado.substring(0, 55)}...`);
        totalInsertados++;
      }
    }

    await client.query('COMMIT');

    console.log(`\n✅ ¡Listo! ${totalInsertados} ejercicios insertados en ${modulos.length} sesiones.`);
    console.log('\nLeyenda de tipos:');
    console.log('  🔵 seleccion_multiple — El estudiante elige la respuesta correcta');
    console.log('  🟡 banco_palabras     — El estudiante completa el espacio en blanco');
    console.log('  🟠 clic_imagen        — El estudiante toca la imagen correcta');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error — rollback:', err.message);
    if (err.detail) console.error('Detalle:', err.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarEjercicios();
