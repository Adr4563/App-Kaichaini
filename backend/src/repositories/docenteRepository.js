const Docente = require('../models/Docente');

class DocenteRepository {
  constructor(database) {
    this.database = database;
  }

  async create(docente) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO USUARIO (
        id, nombre, correo, contrasena, rol, avatar, "codigoValidacion"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        docente.id,
        docente.nombre,
        docente.correo,
        docente.contrasena,
        'Docente',
        docente.avatar || null,
        docente.codigoValidacion,
      ]);
      return new Docente(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear docente: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE id = $1 AND rol = $2';

    try {
      const { rows } = await pool.query(query, [id, 'Docente']);
      return rows.length ? new Docente(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener docente: ${error.message}`);
    }
  }

  async findByEmail(email) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE correo = $1 AND rol = $2';

    try {
      const { rows } = await pool.query(query, [email, 'Docente']);
      return rows.length ? new Docente(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener docente: ${error.message}`);
    }
  }

  async findByCodigoValidacion(codigo) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE "codigoValidacion" = $1 AND rol = $2';

    try {
      const { rows } = await pool.query(query, [codigo, 'Docente']);
      return rows.length ? new Docente(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al buscar por código: ${error.message}`);
    }
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE rol = $1';

    try {
      const { rows } = await pool.query(query, ['Docente']);
      return rows.map(row => new Docente(row));
    } catch (error) {
      throw new Error(`Error al obtener docentes: ${error.message}`);
    }
  }

  async update(id, docenteData) {
    const pool = this.database.getPool();

    // Construir query dinámica basada en los campos proporcionados
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (docenteData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(docenteData.nombre);
    }
    if (docenteData.correo !== undefined) {
      fields.push(`correo = $${paramCount++}`);
      values.push(docenteData.correo);
    }
    if (docenteData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(docenteData.avatar || null);
    }
    if (docenteData.contrasena !== undefined) {
      fields.push(`contrasena = $${paramCount++}`);
      values.push(docenteData.contrasena);
    }
    if (docenteData.resetPasswordToken !== undefined) {
      fields.push(`"resetPasswordToken" = $${paramCount++}`);
      values.push(docenteData.resetPasswordToken || null);
    }
    if (docenteData.resetPasswordExpires !== undefined) {
      fields.push(`"resetPasswordExpires" = $${paramCount++}`);
      values.push(docenteData.resetPasswordExpires || null);
    }

    if (fields.length === 0) {
      return false; // No hay campos para actualizar
    }

    values.push(id);
    values.push('Docente');

    const query = `
      UPDATE USUARIO
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND rol = $${paramCount++}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar docente: ${error.message}`);
    }
  }

  async updateToken(id, tokenJWT) {
    const pool = this.database.getPool();
    const query = `
      UPDATE USUARIO
      SET "tokenJWT" = $1
      WHERE id = $2 AND rol = $3
      RETURNING id
    `;

    try {
      const { rows } = await pool.query(query, [tokenJWT, id, 'Docente']);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar token: ${error.message}`);
    }
  }

  async findByResetToken(token) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE "resetPasswordToken" = $1 AND rol = $2';
    try {
      const { rows } = await pool.query(query, [token, 'Docente']);
      return rows.length ? new (require('../models/Docente'))(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al buscar token: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM USUARIO WHERE id = $1 AND rol = $2 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id, 'Docente']);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar docente: ${error.message}`);
    }
  }
}

module.exports = DocenteRepository;
