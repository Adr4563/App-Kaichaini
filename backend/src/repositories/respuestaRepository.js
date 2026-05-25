const Respuesta = require('../models/Respuesta');
const { v4: uuidv4 } = require('uuid');

class RespuestaRepository {
  constructor(database) {
    this.database = database;
  }

  async create(data) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO respuesta (id, idestudiante, idejercicio, respuesta, escorrecta)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        idestudiante AS "idEstudiante",
        idejercicio  AS "idEjercicio",
        respuesta,
        escorrecta   AS "esCorrecta",
        fecha        AS "fechaRespuesta"
    `;

    try {
      const { rows } = await pool.query(query, [
        data.id || uuidv4(),
        data.idEstudiante,
        data.idEjercicio,
        data.respuesta,
        data.esCorrecta,
      ]);
      return new Respuesta(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear respuesta: ${error.message}`);
    }
  }

  async findByEstudiante(idEstudiante) {
    const pool = this.database.getPool();
    const query = `
      SELECT
        r.id,
        r.idestudiante AS "idEstudiante",
        r.idejercicio  AS "idEjercicio",
        r.respuesta,
        r.escorrecta   AS "esCorrecta",
        r.fecha        AS "fechaRespuesta",
        e.enunciado,
        e.tipo
      FROM respuesta r
      JOIN ejercicio e ON e.id = r.idejercicio
      WHERE r.idestudiante = $1
      ORDER BY r.fecha DESC
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante]);
      return rows.map(row => new Respuesta(row));
    } catch (error) {
      throw new Error(`Error al obtener respuestas: ${error.message}`);
    }
  }

  async findByEstudianteModulo(idEstudiante, idModulo) {
    const pool = this.database.getPool();
    const query = `
      SELECT
        r.id,
        r.idestudiante AS "idEstudiante",
        r.idejercicio  AS "idEjercicio",
        r.respuesta,
        r.escorrecta   AS "esCorrecta",
        r.fecha        AS "fechaRespuesta"
      FROM respuesta r
      JOIN ejercicio e ON e.id = r.idejercicio
      WHERE r.idestudiante = $1
        AND e.idmodulo     = $2
      ORDER BY r.fecha ASC
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idModulo]);
      return rows.map(row => new Respuesta(row));
    } catch (error) {
      throw new Error(`Error al obtener respuestas del módulo: ${error.message}`);
    }
  }

  async contarCorrectasPorModulo(idEstudiante, idModulo) {
    const pool = this.database.getPool();
    const query = `
      SELECT COUNT(*) AS count
      FROM respuesta r
      JOIN ejercicio e ON e.id = r.idejercicio
      WHERE r.idestudiante = $1
        AND e.idmodulo     = $2
        AND r.escorrecta   = true
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idModulo]);
      return parseInt(rows[0].count) || 0;
    } catch (error) {
      throw new Error(`Error al contar respuestas correctas: ${error.message}`);
    }
  }

  async contarTotalCorrectas(idEstudiante) {
    // H.U. 109 - Total de respuestas correctas del estudiante (todas las clases)
    const pool = this.database.getPool();
    const query = `
      SELECT COUNT(*) AS count
      FROM respuesta
      WHERE idestudiante = $1
        AND escorrecta   = true
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante]);
      return parseInt(rows[0].count) || 0;
    } catch (error) {
      throw new Error(`Error al contar respuestas totales: ${error.message}`);
    }
  }
}

module.exports = RespuestaRepository;
