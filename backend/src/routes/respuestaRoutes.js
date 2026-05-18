const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class RespuestaRoutes {
  constructor(respuestaController) {
    this.respuestaController = respuestaController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/respuestas', authMiddleware, (req, res, next) =>
      this.respuestaController.responder(req, res, next)
    );

    this.router.get('/respuestas', authMiddleware, (req, res, next) =>
      this.respuestaController.getHistorial(req, res, next)
    );

    this.router.get('/respuestas/evaluacion/:idModulo', authMiddleware, (req, res, next) =>
      this.respuestaController.getEvaluacionModulo(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = RespuestaRoutes;
