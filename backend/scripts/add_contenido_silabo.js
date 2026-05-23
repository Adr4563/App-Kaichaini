/**
 * Agrega columna contenido a la tabla silabo
 * e inserta el texto del sílabo de Matemática 4° Grado
 */
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, ssl: { rejectUnauthorized: false },
});

const ID_SILABO = '183929f9-91fb-4d6b-b763-3b8d703f5c1f';

const CONTENIDO = `SÍLABO DE MATEMÁTICA — 4° GRADO
Año lectivo 2026

UNIDAD 1: Buscamos alternativas para una adecuada alimentación
Temas: Noción de conjunto · Pertenencia e inclusión · Clasificación de conjuntos · Conjuntos especiales · Unión · Intersección · Diferencia · Patrones de repetición · Geometría básica · Ángulos · Estadística
Producto: Maqueta o infografía sobre alimentación saludable usando conjuntos

UNIDAD 2: Resolvemos problemas de nuestra comunidad
Temas: Números naturales hasta 9 999 · Adición y sustracción · Propiedades · Problemas de enunciado
Producto: Registro de gastos de la comunidad

UNIDAD 3: Emprendemos un negocio escolar
Temas: Multiplicación y división de naturales · Propiedades · Divisibilidad · Múltiplos y divisores
Producto: Plan de negocio con cálculos de ganancia

UNIDAD 4: Cuidamos el medio ambiente
Temas: Fracciones · Fracciones equivalentes · Adición y sustracción de fracciones · Números mixtos
Producto: Informe de reciclaje con fracciones

UNIDAD 5: Promovemos la lectura
Temas: Decimales · Comparación · Adición y sustracción de decimales · Redondeo
Producto: Encuesta de lectura con datos decimales

UNIDAD 6: Participamos en actividades deportivas
Temas: Perímetro y área · Figuras geométricas · Simetría · Transformaciones
Producto: Diseño de cancha escolar con medidas

UNIDAD 7: Valoramos nuestra cultura
Temas: Porcentajes · Descuento · Interés simple · Regla de tres
Producto: Presupuesto de feria cultural

UNIDAD 8: Somos ciudadanos responsables
Temas: Estadística · Tablas y gráficas · Media · Moda · Mediana · Probabilidad básica
Producto: Informe estadístico de participación ciudadana`;

async function run() {
  const client = await pool.connect();
  try {
    // 1. Agregar columna si no existe
    await client.query(`
      ALTER TABLE silabo
      ADD COLUMN IF NOT EXISTS contenido TEXT
    `);
    console.log('✅ Columna contenido agregada (o ya existía)');

    // 2. Insertar el texto
    const { rowCount } = await client.query(
      `UPDATE silabo SET contenido = $1 WHERE id = $2`,
      [CONTENIDO, ID_SILABO]
    );
    console.log(`✅ Contenido insertado (${rowCount} fila actualizada)`);
    console.log('\nPrimeras líneas del contenido guardado:');
    console.log(CONTENIDO.split('\n').slice(0, 4).join('\n'));
  } finally {
    client.release();
    await pool.end();
  }
}
run();
