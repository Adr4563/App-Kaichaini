const Clase = require('../models/Clase');

class ClaseRepository {
  constructor(database) {
    this.database = database;
  }

  async create(clase) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO CLASE (id, nombre, "codigoUnico", curso, "idDocente")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        clase.id,
        clase.nombre,
        clase.codigoUnico,
        clase.curso,
        clase.idDocente,
      ]);
      return new Clase(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear clase: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM CLASE WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new Clase(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener clase: ${error.message}`);
    }
  }

  async findByCodigoUnico(codigo) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM CLASE WHERE "codigoUnico" = $1';

    try {
      const { rows } = await pool.query(query, [codigo]);
      return rows.length ? new Clase(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al buscar clase por código: ${error.message}`);
    }
  }

  async findByDocente(idDocente) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM CLASE WHERE "idDocente" = $1 ORDER BY nombre ASC';

    try {
      const { rows } = await pool.query(query, [idDocente]);
      return rows.map(row => new Clase(row));
    } catch (error) {
      throw new Error(`Error al obtener clases del docente: ${error.message}`);
    }
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM CLASE ORDER BY nombre ASC';

    try {
      const { rows } = await pool.query(query);
      return rows.map(row => new Clase(row));
    } catch (error) {
      throw new Error(`Error al obtener clases: ${error.message}`);
    }
  }

  async update(id, data) {
    const pool = this.database.getPool();

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(data.nombre);
    }
    if (data.codigoUnico !== undefined) {
      fields.push(`"codigoUnico" = $${paramCount++}`);
      values.push(data.codigoUnico);
    }
    if (data.curso !== undefined) {
      fields.push(`curso = $${paramCount++}`);
      values.push(data.curso);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `
      UPDATE CLASE
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar clase: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM CLASE WHERE id = $1 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar clase: ${error.message}`);
    }
  }
}

module.exports = ClaseRepository;
