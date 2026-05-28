class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res, next) {
    try {
      const { rol, nombre, correo, contrasena, codigoValidacion, avatar, colegio } = req.body;

      if (!rol || !['Estudiante', 'Docente'].includes(rol)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Rol debe ser "Estudiante" o "Docente"',
            statusCode: 400,
          },
        });
      }

      let usuario;

      if (rol === 'Estudiante') {
        usuario = await this.authService.registerEstudiante({
          nombre,
          correo,
          contrasena,
          avatar,
          colegio,
        });
      } else {
        usuario = await this.authService.registerDocente({
          nombre,
          correo,
          contrasena,
          codigoValidacion,
          avatar,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: usuario.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Correo y contraseña son requeridos',
            statusCode: 400,
          },
        });
      }

      const result = await this.authService.login(correo, contrasena);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          token: result.token,
          usuario: result.usuario,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const userId = req.user.id;
      const usuario = await this.authService.getPerfil(userId);

      res.status(200).json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const isEstudiante = req.user.rol === 'Estudiante';

      await this.authService.logout(userId, isEstudiante);

      res.status(200).json({
        success: true,
        message: 'Logout exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePerfil(req, res, next) {
    try {
      const userId = req.user.id;
      const { nombre, avatar } = req.body;

      const usuario = await this.authService.updatePerfil(userId, {
        nombre,
        avatar,
      });

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: usuario.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Las contraseñas no coinciden',
            statusCode: 400,
          },
        });
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Correo es requerido',
            statusCode: 400,
          },
        });
      }

      const result = await this.authService.forgotPassword(correo);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Token es requerido',
            statusCode: 400,
          },
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Las contraseñas no coinciden',
            statusCode: 400,
          },
        });
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
