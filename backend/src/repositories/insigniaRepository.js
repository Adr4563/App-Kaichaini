const Insignia = require('../models/Insignia');

class InsigniaRepository {
  constructor(database) {
    this.database = database;
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM INSIGNIA';

    try {
      const { rows } = await pool.query(query);
      return rows.map(row => new Insignia(row));
    } catch (error) {
      throw new Error(`Error al obtener insignias: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM INSIGNIA WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new Insignia(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener insignia: ${error.message}`);
    }
  }

  async findByEstudiante(idEstudiante) {
    // H.U. 118 - Obtener insignias del estudiante
    const pool = this.database.getPool();
    const query = `
      SELECT i.* FROM insignia i
      JOIN estudiante_insignia ei ON i.id = ei.idinsignia
      WHERE ei.idestudiante = $1
      ORDER BY ei.fechadesbloqueo DESC
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante]);
      return rows.map(row => new Insignia(row));
    } catch (error) {
      throw new Error(`Error al obtener insignias del estudiante: ${error.message}`);
    }
  }

  async desbloquear(idEstudiante, idInsignia) {
    // H.U. 109 - Desbloquear insignia
    const pool = this.database.getPool();
    const query = `
      INSERT INTO estudiante_insignia (idestudiante, idinsignia, fechadesbloqueo)
      VALUES ($1, $2, NOW())
      ON CONFLICT DO NOTHING
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idInsignia]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al desbloquear insignia: ${error.message}`);
    }
  }

  async hasInsignia(idEstudiante, idInsignia) {
    const pool = this.database.getPool();
    const query = `
      SELECT idestudiante FROM estudiante_insignia
      WHERE idestudiante = $1 AND idinsignia = $2
    `;

    try {
      const { rows } = await pool.query(query, [idEstudiante, idInsignia]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar insignia: ${error.message}`);
    }
  }
}

module.exports = InsigniaRepository;
