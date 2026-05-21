const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class SilaboRoutes {
  constructor(silaboController) {
    this.silaboController = silaboController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/silabos/:idClase', authMiddleware, (req, res, next) =>
      this.silaboController.getSilaboByClase(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = SilaboRoutes;
