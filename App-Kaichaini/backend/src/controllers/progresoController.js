class ProgresoController {
  constructor(progresoService) {
    this.progresoService = progresoService;
  }

  async getProgresoModulo(req, res, next) {
    try {
      const { idModulo } = req.params;
      const idEstudiante = req.user.id;

      const progreso = await this.progresoService.getProgresoModulo(idEstudiante, idModulo);

      res.status(200).json({
        success: true,
        data: progreso,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgresoClase(req, res, next) {
    try {
      const { idClase } = req.params;
      const idEstudiante = req.user.id;

      const progreso = await this.progresoService.getProgresoClase(idEstudiante, idClase);

      res.status(200).json({
        success: true,
        data: progreso,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProgresoController;
