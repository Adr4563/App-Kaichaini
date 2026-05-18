const Modulo = require('../models/Modulo');
const { v4: uuidv4 } = require('uuid');

class ModuloRepository {
  constructor(database) {
    this.database = database;
  }

  async create(modulo) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO MODULO (id, "idClase", nombre, orden, bimestre, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        modulo.id || uuidv4(),
        modulo.idClase,
        modulo.nombre,
        modulo.orden,
        modulo.bimestre,
        modulo.estado || 'bloqueado',
      ]);
      return new Modulo(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear módulo: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM MODULO WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new Modulo(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener módulo: ${error.message}`);
    }
  }

  async findByClase(idClase) {
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM MODULO
      WHERE "idClase" = $1
      ORDER BY bimestre ASC, orden ASC
    `;

    try {
      const { rows } = await pool.query(query, [idClase]);
      return rows.map(row => new Modulo(row));
    } catch (error) {
      throw new Error(`Error al obtener módulos de la clase: ${error.message}`);
    }
  }

  async findByClaseBimestre(idClase, bimestre) {
    const pool = this.database.getPool();
    const query = `
      SELECT * FROM MODULO
      WHERE "idClase" = $1 AND bimestre = $2
      ORDER BY orden ASC
    `;

    try {
      const { rows } = await pool.query(query, [idClase, bimestre]);
      return rows.map(row => new Modulo(row));
    } catch (error) {
      throw new Error(`Error al obtener módulos: ${error.message}`);
    }
  }

  async findSiguienteModulo(idModulo) {
    // Obtener el módulo siguiente al actual (mismo bimestre, orden + 1)
    const pool = this.database.getPool();

    try {
      // Primero obtener el módulo actual
      const moduloActual = await this.findById(idModulo);
      if (!moduloActual) return null;

      // Luego buscar el siguiente
      const query = `
        SELECT * FROM MODULO
        WHERE "idClase" = $1
        AND bimestre = $2
        AND orden = $3
        LIMIT 1
      `;

      const { rows } = await pool.query(query, [
        moduloActual.idClase,
        moduloActual.bimestre,
        moduloActual.orden + 1,
      ]);

      return rows.length ? new Modulo(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener siguiente módulo: ${error.message}`);
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
    if (data.estado !== undefined) {
      fields.push(`estado = $${paramCount++}`);
      values.push(data.estado);
    }
    if (data.orden !== undefined) {
      fields.push(`orden = $${paramCount++}`);
      values.push(data.orden);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `
      UPDATE MODULO
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar módulo: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM MODULO WHERE id = $1 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar módulo: ${error.message}`);
    }
  }

  async desbloquear(id) {
    // H.U. 122 - Desbloquear módulo
    return await this.update(id, { estado: 'disponible' });
  }
}

module.exports = ModuloRepository;
