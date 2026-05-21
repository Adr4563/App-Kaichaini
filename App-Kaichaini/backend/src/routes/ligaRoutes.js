const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class LigaRoutes {
  constructor(ligaController) {
    this.ligaController = ligaController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /ligas - Obtener todas las ligas (auth)
    this.router.get('/ligas', authMiddleware, (req, res, next) =>
      this.ligaController.getLigas(req, res, next)
    );

    // GET /ligas/ranking - Obtener ranking de estudiantes (auth)
    this.router.get('/ligas/ranking', authMiddleware, (req, res, next) =>
      this.ligaController.getRanking(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = LigaRoutes;
