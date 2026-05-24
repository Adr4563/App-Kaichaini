const XP = require('../models/XP');
const { v4: uuidv4 } = require('uuid');

class XPRepository {
  constructor(database) {
    this.database = database;
  }

  async create(data) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO XP (id, "idEstudiante", "puntosTotal")
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        data.id || uuidv4(),
        data.idEstudiante,
        data.puntosTotal || 0,
      ]);
      return new XP(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear XP: ${error.message}`);
    }
  }

  async findByEstudiante(idEstudiante) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM XP WHERE "idEstudiante" = $1';

    try {
      const { rows } = await pool.query(query, [idEstudiante]);
      return rows.length ? new XP(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener XP del estudiante: ${error.message}`);
    }
  }

  async otorgar(idEstudiante, puntos) {
    // Sumar XP al estudiante
    const pool = this.database.getPool();
    const query = `
      UPDATE XP
      SET "puntosTotal" = "puntosTotal" + $1
      WHERE "idEstudiante" = $2
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [puntos, idEstudiante]);
      return rows.length ? new XP(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al otorgar XP: ${error.message}`);
    }
  }

  async getXPPorClase(idEstudiante, idClase) {
    // H.U. 302 - Obtener XP total del estudiante en una clase específica
    // Calcula sumando XP de todas las respuestas correctas del estudiante en esa clase
    const pool = this.database.getPool();

    // Esta consulta suma el XP ganado en respuestas correctas en una clase
    // XP se otorga basado en el tipo de ejercicio
    const query = `
      SELECT COALESCE(SUM(
        CASE
          WHEN e.tipo = 'seleccion_multiple' THEN 10
          WHEN e.tipo = 'clic_numero' THEN 10
          WHEN e.tipo = 'banco_palabras' THEN 15
          WHEN e.tipo = 'drag_drop' THEN 15
          ELSE 0
        END
      ), 0) as "totalXP"
      FROM respuesta r
      JOIN ejercicio e ON r.idejercicio = e.id
      JOIN modulo m ON e.idmodulo = m.id
      WHERE r.idestudiante = $1
      AND m.idclase = $2
      AND r.escorrecta = true
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idClase]);
      return rows[0]?.totalXP || 0;
    } catch (error) {
      throw new Error(`Error al obtener XP por clase: ${error.message}`);
    }
  }

  async update(idEstudiante, puntosTotal) {
    const pool = this.database.getPool();
    const query = `
      UPDATE XP
      SET "puntosTotal" = $1
      WHERE "idEstudiante" = $2
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [puntosTotal, idEstudiante]);
      return rows.length ? new XP(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al actualizar XP: ${error.message}`);
    }
  }
}

module.exports = XPRepository;
