const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole: roleMiddleware } = require('../middleware/roleMiddleware');

class ClaseRoutes {
  constructor(claseController) {
    this.claseController = claseController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // POST /clases/validar-codigo - Validar código de clase (H.U. 001, público)
    this.router.post('/clases/validar-codigo', (req, res, next) =>
      this.claseController.validarCodigo(req, res, next)
    );

    // POST /clases/unirse - Unirse a una clase (H.U. 011, auth estudiante)
    this.router.post('/clases/unirse', authMiddleware, (req, res, next) =>
      this.claseController.unirse(req, res, next)
    );

    // GET /clases/mis-clases - Obtener mis clases (H.U. 117, auth)
    this.router.get('/clases/mis-clases', authMiddleware, (req, res, next) =>
      this.claseController.getMisClases(req, res, next)
    );

    // GET /clases/:id - Obtener clase por ID (auth)
    this.router.get('/clases/:id', authMiddleware, (req, res, next) =>
      this.claseController.getById(req, res, next)
    );

    // GET /clases/:id/estudiantes - Obtener estudiantes de una clase (auth docente)
    this.router.get('/clases/:id/estudiantes', authMiddleware, (req, res, next) =>
      this.claseController.getEstudiantes(req, res, next)
    );

    // POST /clases - Crear nueva clase (auth docente)
    this.router.post('/clases', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.claseController.create(req, res, next)
    );

    // PUT /clases/:id - Actualizar clase (auth docente)
    this.router.put('/clases/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.claseController.update(req, res, next)
    );

    // DELETE /clases/:id - Eliminar clase (auth docente)
    this.router.delete('/clases/:id', authMiddleware, roleMiddleware(['Docente']), (req, res, next) =>
      this.claseController.delete(req, res, next)
    );

    // POST /clases/abandonar - Abandonar una clase (auth estudiante)
    this.router.post('/clases/abandonar', authMiddleware, (req, res, next) =>
      this.claseController.abandonar(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ClaseRoutes;
