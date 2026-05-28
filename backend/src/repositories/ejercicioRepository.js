const Ejercicio = require('../models/Ejercicio');
const { v4: uuidv4 } = require('uuid');

class EjercicioRepository {
  constructor(database) {
    this.database = database;
  }

  async create(ejercicio) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO ejercicio (id, idmodulo, tipo, enunciado, respuestacorrecta, opciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        idmodulo          AS "idModulo",
        tipo,
        enunciado,
        respuestacorrecta AS "respuestaCorrecta",
        opciones
    `;

    try {
      const { rows } = await pool.query(query, [
        ejercicio.id || uuidv4(),
        ejercicio.idModulo,
        ejercicio.tipo || 'seleccion_multiple',
        ejercicio.enunciado,
        ejercicio.respuestaCorrecta,
        ejercicio.opciones || '[]',
      ]);
      return new Ejercicio(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear ejercicio: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = `
      SELECT id, idmodulo AS "idModulo", tipo, enunciado,
             respuestacorrecta AS "respuestaCorrecta", opciones
      FROM ejercicio WHERE id = $1
    `;

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new Ejercicio(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener ejercicio: ${error.message}`);
    }
  }

  async findByModulo(idModulo) {
    const pool = this.database.getPool();
    const query = `
      SELECT id, idmodulo AS "idModulo", tipo, enunciado,
             respuestacorrecta AS "respuestaCorrecta", opciones
      FROM ejercicio WHERE idmodulo = $1 ORDER BY id ASC
    `;

    try {
      const { rows } = await pool.query(query, [idModulo]);
      return rows.map(row => new Ejercicio(row));
    } catch (error) {
      throw new Error(`Error al obtener ejercicios del módulo: ${error.message}`);
    }
  }

  async contarByModulo(idModulo) {
    // Solo cuenta ejercicios válidos (los que ve el estudiante en el frontend)
    const pool = this.database.getPool();
    const query = `
      SELECT COUNT(*) AS count
      FROM ejercicio
      WHERE idmodulo = $1
        AND opciones IS NOT NULL
        AND opciones != '[]'
        AND tipo IN ('seleccion_multiple', 'clic_numero')
    `;

    try {
      const { rows } = await pool.query(query, [idModulo]);
      return parseInt(rows[0].count) || 0;
    } catch (error) {
      throw new Error(`Error al contar ejercicios: ${error.message}`);
    }
  }

  async update(id, data) {
    const pool = this.database.getPool();

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramCount++}`);
      values.push(data.tipo);
    }
    if (data.enunciado !== undefined) {
      fields.push(`enunciado = $${paramCount++}`);
      values.push(data.enunciado);
    }
    if (data.respuestaCorrecta !== undefined) {
      fields.push(`respuestacorrecta = $${paramCount++}`);
      values.push(data.respuestaCorrecta);
    }
    if (data.opciones !== undefined) {
      fields.push(`opciones = $${paramCount++}`);
      values.push(data.opciones);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `
      UPDATE ejercicio
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING
        id,
        idmodulo          AS "idModulo",
        tipo,
        enunciado,
        respuestacorrecta AS "respuestaCorrecta",
        opciones
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar ejercicio: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM EJERCICIO WHERE id = $1 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar ejercicio: ${error.message}`);
    }
  }
}

module.exports = EjercicioRepository;
