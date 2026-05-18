class MapaController {
  constructor(mapaService) {
    this.mapaService = mapaService;
  }

  async getMapaCompleto(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const mapa = await this.mapaService.getMapaCompleto(idEstudiante);

      res.status(200).json({
        success: true,
        data: mapa,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMapaClaseByBimestre(req, res, next) {
    try {
      const { idClase, bimestre } = req.params;
      const idEstudiante = req.user.id;

      if (!idClase || !bimestre) {
        return res.status(400).json({
          success: false,
          error: { message: 'Clase y bimestre requeridos', statusCode: 400 },
        });
      }

      const mapa = await this.mapaService.getMapaClaseByBimestre(
        idEstudiante,
        idClase,
        parseInt(bimestre)
      );

      res.status(200).json({
        success: true,
        data: mapa,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MapaController;
