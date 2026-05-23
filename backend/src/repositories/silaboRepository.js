const Silabo = require('../models/Silabo');

class SilaboRepository {
  constructor(database) {
    this.database = database;
  }

  async findByClase(idClase) {
    const pool = this.database.getPool();
    const query = `
      SELECT id,
             idclase      AS "idClase",
             archivourl   AS "archivoUrl",
             fechasubida  AS "fechaSubida"
      FROM silabo
      WHERE idclase = $1
    `;

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.length ? new Silabo(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener silabo: ${error.message}`);
    }
  }
}

module.exports = SilaboRepository;
