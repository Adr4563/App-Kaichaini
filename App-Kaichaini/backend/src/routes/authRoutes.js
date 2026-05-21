const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

class AuthRoutes {
  constructor(authController) {
    this.authController = authController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // POST /auth/register - Registro de Estudiante o Docente
    this.router.post('/auth/register', (req, res, next) =>
      this.authController.register(req, res, next)
    );

    // POST /auth/login - Login
    this.router.post('/auth/login', (req, res, next) =>
      this.authController.login(req, res, next)
    );

    // GET /auth/me - Obtener perfil del usuario actual (requiere JWT)
    this.router.get('/auth/me', authMiddleware, (req, res, next) =>
      this.authController.me(req, res, next)
    );

    // POST /auth/logout - Logout (requiere JWT)
    this.router.post('/auth/logout', authMiddleware, (req, res, next) =>
      this.authController.logout(req, res, next)
    );

    // PUT /auth/perfil - Actualizar perfil (requiere JWT)
    this.router.put('/auth/perfil', authMiddleware, (req, res, next) =>
      this.authController.updatePerfil(req, res, next)
    );

    // POST /auth/cambiar-contrasena - Cambiar contraseña (requiere JWT)
    this.router.post('/auth/cambiar-contrasena', authMiddleware, (req, res, next) =>
      this.authController.changePassword(req, res, next)
    );

    // POST /auth/forgot-password - Solicitar recuperación de contraseña (H.U. 008)
    this.router.post('/auth/forgot-password', (req, res, next) =>
      this.authController.forgotPassword(req, res, next)
    );

    // POST /auth/reset-password - Restablecer contraseña con token (H.U. 008)
    this.router.post('/auth/reset-password', (req, res, next) =>
      this.authController.resetPassword(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = AuthRoutes;
