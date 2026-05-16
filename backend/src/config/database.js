const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      const connection = await this.pool.getConnection();
      console.log('✓ Base de datos conectada exitosamente');
      connection.release();
      return true;
    } catch (error) {
      console.error('✗ Error conectando a la base de datos:', error.message);
      process.exit(1);
    }
  }

  getPool() {
    return this.pool;
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('✓ Desconectado de la base de datos');
    }
  }
}

module.exports = DatabaseConnection;
