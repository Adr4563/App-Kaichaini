const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class MaterialRoutes {
  constructor(materialController) {
    this.materialController = materialController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/material', authMiddleware, (req, res, next) =>
      this.materialController.getMaterial(req, res, next)
    );

    this.router.get('/material/buscar', authMiddleware, (req, res, next) =>
      this.materialController.buscar(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = MaterialRoutes;
