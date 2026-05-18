const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

class ModuloRoutes {
  constructor(moduloController) {
    this.moduloController = moduloController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // GET /modulos - Obtener módulos por clase y bimestre (H.U. 117, auth)
    this.router.get('/modulos', authMiddleware, (req, res, next) =>
      this.moduloController.getByClaseBimestre(req, res, next)
    );

    // GET /modulos/:id - Obtener módulo por ID (auth)
    this.router.get('/modulos/:id', authMiddleware, (req, res, next) =>
      this.moduloController.getById(req, res, next)
    );

    // POST /modulos/:idClase - Crear nuevo módulo (auth docente)
    this.router.post('/modulos/:idClase', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.moduloController.create(req, res, next)
    );

    // PUT /modulos/:id - Actualizar módulo (auth docente)
    this.router.put('/modulos/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.moduloController.update(req, res, next)
    );

    // DELETE /modulos/:id - Eliminar módulo (auth docente)
    this.router.delete('/modulos/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.moduloController.delete(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ModuloRoutes;
