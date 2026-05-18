const Liga = require('../models/Liga');
const { v4: uuidv4 } = require('uuid');

class LigaRepository {
  constructor(database) {
    this.database = database;
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM LIGA ORDER BY "umbralMinimo" ASC';

    try {
      const { rows } = await pool.query(query);
      return rows.map(row => new Liga(row));
    } catch (error) {
      throw new Error(`Error al obtener ligas: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM LIGA WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new Liga(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener liga: ${error.message}`);
    }
  }

  async findByPuntos(puntos) {
    // H.U. 120 - Obtener liga correspondiente a un rango de XP
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM LIGA
      WHERE "umbralMinimo" <= $1 AND "umbralMaximo" >= $1
      LIMIT 1
    `;

    try {
      const { rows } = await pool.query(query, [puntos]);
      return rows.length ? new Liga(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener liga por puntos: ${error.message}`);
    }
  }

  async seedLigas() {
    // Crear las ligas iniciales si no existen (H.U. 120)
    const pool = this.database.getPool();

    const ligas = [
      { nombre: 'Amauta', umbralMinimo: 0, umbralMaximo: 499 },
      { nombre: 'Panaca', umbralMinimo: 500, umbralMaximo: 999 },
      { nombre: 'Auqui', umbralMinimo: 1000, umbralMaximo: 1999 },
      { nombre: 'Inca', umbralMinimo: 2000, umbralMaximo: Number.MAX_SAFE_INTEGER },
    ];

    for (const liga of ligas) {
      const checkQuery = 'SELECT id FROM LIGA WHERE nombre = $1';
      const { rows } = await pool.query(checkQuery, [liga.nombre]);

      if (rows.length === 0) {
        const insertQuery = `
          INSERT INTO LIGA (id, nombre, "umbralMinimo", "umbralMaximo")
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(insertQuery, [
          uuidv4(),
          liga.nombre,
          liga.umbralMinimo,
          liga.umbralMaximo,
        ]);
      }
    }
  }

  async create(liga) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO LIGA (id, nombre, "umbralMinimo", "umbralMaximo")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        liga.id || uuidv4(),
        liga.nombre,
        liga.umbralMinimo,
        liga.umbralMaximo,
      ]);
      return new Liga(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear liga: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM LIGA WHERE id = $1 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar liga: ${error.message}`);
    }
  }
}

module.exports = LigaRepository;
