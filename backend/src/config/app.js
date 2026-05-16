const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

class AppConfig {
  constructor() {
    this.app = express();
  }

  configureMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware personalizado para logging
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  registerRoutes(routes) {
    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    routes.forEach((route) => {
      this.app.use(apiPrefix, route);
    });
  }

  configureErrorHandler(errorHandler) {
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

module.exports = AppConfig;
