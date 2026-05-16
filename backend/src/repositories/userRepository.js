const User = require('../models/User');

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async create(user) {
    const pool = this.database.getPool();
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

    try {
      const [result] = await pool.execute(query, [user.name, user.email, user.password]);
      user.id = result.insertId;
      return user;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async findById(id) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM users WHERE id = ?';

    try {
      const [rows] = await pool.execute(query, [id]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findByEmail(email) {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM users WHERE email = ?';

    try {
      const [rows] = await pool.execute(query, [email]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findAll() {
    const pool = this.database.getPool();
    const query = 'SELECT * FROM users';

    try {
      const [rows] = await pool.execute(query);
      return rows.map(row => new User(row));
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async update(id, userData) {
    const pool = this.database.getPool();
    const query = 'UPDATE users SET name = ?, email = ?, updatedAt = NOW() WHERE id = ?';

    try {
      const [result] = await pool.execute(query, [userData.name, userData.email, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async delete(id) {
    const pool = this.database.getPool();
    const query = 'DELETE FROM users WHERE id = ?';

    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
