const Estudiante = require('../models/Estudiante');

class EstudianteRepository {
  constructor(database) {
    this.database = database;
  }

  async create(estudiante) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO USUARIO (
        id, nombre, correo, contrasena, rol, avatar, "idLiga",
        "colorTema", colegio, "intentosFallidos"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        estudiante.id,
        estudiante.nombre,
        estudiante.correo,
        estudiante.contrasena,
        'Estudiante',
        estudiante.avatar || null,
        estudiante.idLiga || null,
        estudiante.colorTema || 'light',
        estudiante.colegio || null,
        estudiante.intentosFallidos || 0,
      ]);
      return new Estudiante(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear estudiante: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE id = $1 AND rol = $2';

    try {
      const { rows } = await pool.query(query, [id, 'Estudiante']);
      return rows.length ? new Estudiante(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener estudiante: ${error.message}`);
    }
  }

  async findByEmail(email) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE correo = $1 AND rol = $2';

    try {
      const { rows } = await pool.query(query, [email, 'Estudiante']);
      return rows.length ? new Estudiante(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener estudiante: ${error.message}`);
    }
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE rol = $1';

    try {
      const { rows } = await pool.query(query, ['Estudiante']);
      return rows.map(row => new Estudiante(row));
    } catch (error) {
      throw new Error(`Error al obtener estudiantes: ${error.message}`);
    }
  }

  async update(id, estudianteData) {
    const pool = this.database.getPool();

    // Construir query dinámica basada en los campos proporcionados
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (estudianteData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(estudianteData.nombre);
    }
    if (estudianteData.correo !== undefined) {
      fields.push(`correo = $${paramCount++}`);
      values.push(estudianteData.correo);
    }
    if (estudianteData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(estudianteData.avatar || null);
    }
    if (estudianteData.idLiga !== undefined) {
      fields.push(`"idLiga" = $${paramCount++}`);
      values.push(estudianteData.idLiga || null);
    }
    if (estudianteData.colorTema !== undefined) {
      fields.push(`"colorTema" = $${paramCount++}`);
      values.push(estudianteData.colorTema);
    }
    if (estudianteData.colegio !== undefined) {
      fields.push(`colegio = $${paramCount++}`);
      values.push(estudianteData.colegio || null);
    }
    if (estudianteData.contrasena !== undefined) {
      fields.push(`contrasena = $${paramCount++}`);
      values.push(estudianteData.contrasena);
    }
    if (estudianteData.intentosFallidos !== undefined) {
      fields.push(`"intentosFallidos" = $${paramCount++}`);
      values.push(estudianteData.intentosFallidos);
    }
    if (estudianteData.bloqueadoHasta !== undefined) {
      fields.push(`"bloqueadoHasta" = $${paramCount++}`);
      values.push(estudianteData.bloqueadoHasta || null);
    }
    if (estudianteData.resetPasswordToken !== undefined) {
      fields.push(`"resetPasswordToken" = $${paramCount++}`);
      values.push(estudianteData.resetPasswordToken || null);
    }
    if (estudianteData.resetPasswordExpires !== undefined) {
      fields.push(`"resetPasswordExpires" = $${paramCount++}`);
      values.push(estudianteData.resetPasswordExpires || null);
    }

    if (fields.length === 0) {
      return false; // No hay campos para actualizar
    }

    values.push(id);
    values.push('Estudiante');

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
      throw new Error(`Error al actualizar estudiante: ${error.message}`);
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
      const { rows } = await pool.query(query, [tokenJWT, id, 'Estudiante']);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar token: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM USUARIO WHERE id = $1 AND rol = $2 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id, 'Estudiante']);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar estudiante: ${error.message}`);
    }
  }
}

module.exports = EstudianteRepository;
