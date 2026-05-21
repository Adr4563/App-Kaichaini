const EstudianteClase = require('../models/EstudianteClase');

class EstudianteClaseRepository {
  constructor(database) {
    this.database = database;
  }

  async create(data) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO ESTUDIANTE_CLASE ("idEstudiante", "idClase", "fechaIngreso")
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        data.idEstudiante,
        data.idClase,
        data.fechaIngreso || new Date(),
      ]);
      return new EstudianteClase(rows[0]);
    } catch (error) {
      throw new Error(`Error al agregar estudiante a clase: ${error.message}`);
    }
  }

  async findByEstudiante(idEstudiante) {
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM ESTUDIANTE_CLASE
      WHERE "idEstudiante" = $1
      ORDER BY "fechaIngreso" DESC
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante]);
      return rows.map(row => new EstudianteClase(row));
    } catch (error) {
      throw new Error(`Error al obtener clases del estudiante: ${error.message}`);
    }
  }

  async findByClase(idClase) {
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM ESTUDIANTE_CLASE
      WHERE "idClase" = $1
      ORDER BY "fechaIngreso" ASC
    `;

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.map(row => new EstudianteClase(row));
    } catch (error) {
      throw new Error(`Error al obtener estudiantes de la clase: ${error.message}`);
    }
  }

  async findByEstudianteClase(idEstudiante, idClase) {
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM ESTUDIANTE_CLASE
      WHERE "idEstudiante" = $1 AND "idClase" = $2
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idClase]);
      return rows.length ? new EstudianteClase(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener relación estudiante-clase: ${error.message}`);
    }
  }

  async delete(idEstudiante, idClase) {
    const pool = this.database.getPool();
    const query = `
      DELETE FROM ESTUDIANTE_CLASE
      WHERE "idEstudiante" = $1 AND "idClase" = $2
      RETURNING "idEstudiante"
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idClase]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar estudiante de clase: ${error.message}`);
    }
  }

  async deleteByClase(idClase) {
    const pool = this.database.getPool();
    const query = `
      DELETE FROM ESTUDIANTE_CLASE
      WHERE "idClase" = $1
      RETURNING "idClase"
    `;

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.length;
    } catch (error) {
      throw new Error(`Error al eliminar estudiantes de clase: ${error.message}`);
    }
  }
}

module.exports = EstudianteClaseRepository;
