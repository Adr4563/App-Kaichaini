const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class InsigniaRoutes {
  constructor(insigniaController) {
    this.insigniaController = insigniaController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/insignias', authMiddleware, (req, res, next) =>
      this.insigniaController.getInsignias(req, res, next)
    );

    this.router.get('/insignias/mis-insignias', authMiddleware, (req, res, next) =>
      this.insigniaController.getMisInsignias(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = InsigniaRoutes;
