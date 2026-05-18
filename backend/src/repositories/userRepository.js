const User = require('../models/User');

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async create(user) {
    const pool = this.database.getPool();
    const query = `
      INSERT INTO USUARIO (id, nombre, correo, contrasena, rol)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        user.id,
        user.nombre || user.name,
        user.correo || user.email,
        user.contrasena || user.password,
        user.rol || 'Estudiante',
      ]);
      return new User(rows[0]);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE id = $1';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findByEmail(email) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO WHERE correo = $1';

    try {
      const { rows } = await pool.query(query, [email]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM USUARIO';

    try {
      const { rows } = await pool.query(query);
      return rows.map(row => new User(row));
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async update(id, userData) {
    const pool = this.database.getPool();
    const query = `
      UPDATE USUARIO
      SET nombre = $1, correo = $2
      WHERE id = $3
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        userData.nombre || userData.name,
        userData.correo || userData.email,
        id,
      ]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM USUARIO WHERE id = $1 RETURNING id';

    try {
      const { rows } = await pool.query(query, [id]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
