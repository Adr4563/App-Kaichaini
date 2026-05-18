const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

class EjercicioRoutes {
  constructor(ejercicioController) {
    this.ejercicioController = ejercicioController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/ejercicios', authMiddleware, (req, res, next) =>
      this.ejercicioController.getByModulo(req, res, next)
    );

    this.router.get('/ejercicios/:id', authMiddleware, (req, res, next) =>
      this.ejercicioController.getById(req, res, next)
    );

    this.router.post('/ejercicios', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.ejercicioController.create(req, res, next)
    );

    this.router.put('/ejercicios/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.ejercicioController.update(req, res, next)
    );

    this.router.delete('/ejercicios/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.ejercicioController.delete(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = EjercicioRoutes;
