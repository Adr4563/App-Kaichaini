class PerfilController {
  constructor(perfilService) {
    this.perfilService = perfilService;
  }

  async getPerfilCompleto(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const perfil = await this.perfilService.getPerfilCompleto(idEstudiante);

      res.status(200).json({
        success: true,
        data: perfil,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PerfilController;
