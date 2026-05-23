const { Pool } = require('pg');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = new Pool({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port:     process.env.DB_PORT || 5432,
        ssl: { rejectUnauthorized: false },
      });

      const client = await this.pool.connect();
      console.log('✓ Base de datos conectada exitosamente');
      client.release();
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
