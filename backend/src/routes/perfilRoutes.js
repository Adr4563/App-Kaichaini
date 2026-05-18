const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class PerfilRoutes {
  constructor(perfilController) {
    this.perfilController = perfilController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/perfil', authMiddleware, (req, res, next) =>
      this.perfilController.getPerfilCompleto(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = PerfilRoutes;
