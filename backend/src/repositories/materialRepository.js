const Material = require('../models/Material');

class MaterialRepository {
  constructor(database) {
    this.database = database;
  }

  async findByClase(idClase) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM MATERIAL WHERE "idClase" = $1';

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al obtener material: ${error.message}`);
    }
  }

  async findByModulo(idModulo) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM MATERIAL WHERE "idModulo" = $1';

    try {
      const { rows } = await pool.query(query, [idModulo]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al obtener material: ${error.message}`);
    }
  }

  async buscarPorNombre(query, idClase) {
    // H.U. 408 - Buscar material por nombre
    const pool = this.database.getPool();
    const sql = `
      SELECT * FROM MATERIAL
      WHERE "idClase" = $1 AND nombre ILIKE $2
      ORDER BY nombre ASC
    `;

    try {
      const { rows } = await pool.query(sql, [idClase, `%${query}%`]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al buscar material: ${error.message}`);
    }
  }
}

module.exports = MaterialRepository;
