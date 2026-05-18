const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class ProgresoRoutes {
  constructor(progresoController) {
    this.progresoController = progresoController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/progreso/modulo/:idModulo', authMiddleware, (req, res, next) =>
      this.progresoController.getProgresoModulo(req, res, next)
    );

    this.router.get('/progreso/clase/:idClase', authMiddleware, (req, res, next) =>
      this.progresoController.getProgresoClase(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ProgresoRoutes;
