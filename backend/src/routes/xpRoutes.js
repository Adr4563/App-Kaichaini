const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class XPRoutes {
  constructor(xpController) {
    this.xpController = xpController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /xp - Obtener XP total del usuario (auth)
    this.router.get('/xp', authMiddleware, (req, res, next) =>
      this.xpController.getXP(req, res, next)
    );

    // GET /xp/clase/:idClase - Obtener XP en una clase específica (H.U. 302, auth)
    this.router.get('/xp/clase/:idClase', authMiddleware, (req, res, next) =>
      this.xpController.getXPPorClase(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = XPRoutes;
