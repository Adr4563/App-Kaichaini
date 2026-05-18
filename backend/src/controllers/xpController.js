class XPController {
  constructor(xpService) {
    this.xpService = xpService;
  }

  async getXP(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const xpTotal = await this.xpService.getXPTotal(idEstudiante);

      res.status(200).json({
        success: true,
        data: {
          xpTotal,
          idEstudiante,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getXPPorClase(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const { idClase } = req.params;

      if (!idClase) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID de clase requerido',
            statusCode: 400,
          },
        });
      }

      const xpTotal = await this.xpService.getXPPorClase(idEstudiante, idClase);

      res.status(200).json({
        success: true,
        data: {
          xpTotal,
          idEstudiante,
          idClase,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = XPController;
