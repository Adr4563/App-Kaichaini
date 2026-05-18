const Respuesta = require('../models/Respuesta');
const { v4: uuidv4 } = require('uuid');

class RespuestaRepository {
  constructor(database) {
    this.database = database;
  }

  async create(data) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO RESPUESTA (id, "idEstudiante", "idEjercicio", respuesta, "esCorrecta")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
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
      SELECT r.* FROM RESPUESTA r
      JOIN EJERCICIO e ON r."idEjercicio" = e.id
      WHERE r."idEstudiante" = $1
      ORDER BY r."fechaRespuesta" DESC
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
      SELECT r.* FROM RESPUESTA r
      JOIN EJERCICIO e ON r."idEjercicio" = e.id
      WHERE r."idEstudiante" = $1 AND e."idModulo" = $2
      ORDER BY r."fechaRespuesta" ASC
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
      SELECT COUNT(*) as count FROM RESPUESTA r
      JOIN EJERCICIO e ON r."idEjercicio" = e.id
      WHERE r."idEstudiante" = $1 AND e."idModulo" = $2 AND r."esCorrecta" = true
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idModulo]);
      return parseInt(rows[0].count) || 0;
    } catch (error) {
      throw new Error(`Error al contar respuestas correctas: ${error.message}`);
    }
  }
}

module.exports = RespuestaRepository;
