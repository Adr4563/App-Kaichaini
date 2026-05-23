const Material = require('../models/Material');

class MaterialRepository {
  constructor(database) {
    this.database = database;
  }

  async findByClase(idClase) {
    const pool = this.database.getPool();
    const query = `
      SELECT id,
             idclase    AS "idClase",
             idmodulo   AS "idModulo",
             nombre,
             archivourl AS "archivoUrl",
             tipo
      FROM material
      WHERE idclase = $1
    `;

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al obtener material: ${error.message}`);
    }
  }

  async findByModulo(idModulo) {
    const pool = this.database.getPool();
    const query = `
      SELECT id,
             idclase    AS "idClase",
             idmodulo   AS "idModulo",
             nombre,
             archivourl AS "archivoUrl",
             tipo
      FROM material
      WHERE idmodulo = $1
    `;

    try {
      const { rows } = await pool.query(query, [idModulo]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al obtener material: ${error.message}`);
    }
  }

  async buscarPorNombre(query, idClase) {
    // H.U. 408 - Buscar material por nombre
    // Prioridad: coincidencia exacta (0) primero, parcial (1) después
    // Dentro de cada grupo, orden alfabético por nombre
    const pool = this.database.getPool();
    const sql = `
      SELECT id,
             idclase    AS "idClase",
             idmodulo   AS "idModulo",
             nombre,
             archivourl AS "archivoUrl",
             tipo
      FROM material
      WHERE idclase = $1 AND nombre ILIKE $2
      ORDER BY
        CASE WHEN LOWER(nombre) = LOWER($3) THEN 0 ELSE 1 END ASC,
        nombre ASC
    `;

    try {
      const { rows } = await pool.query(sql, [idClase, `%${query}%`, query]);
      return rows.map(row => new Material(row));
    } catch (error) {
      throw new Error(`Error al buscar material: ${error.message}`);
    }
  }
}

module.exports = MaterialRepository;
