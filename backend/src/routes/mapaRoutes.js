const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class MapaRoutes {
  constructor(mapaController) {
    this.mapaController = mapaController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/mapa', authMiddleware, (req, res, next) =>
      this.mapaController.getMapaCompleto(req, res, next)
    );

    this.router.get('/mapa/clase/:idClase/bimestre/:bimestre', authMiddleware, (req, res, next) =>
      this.mapaController.getMapaClaseByBimestre(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = MapaRoutes;
