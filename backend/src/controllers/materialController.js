class MaterialController {
  constructor(materialService) {
    this.materialService = materialService;
  }

  async getMaterial(req, res, next) {
    try {
      const { idClase, idModulo } = req.query;

      let material;
      if (idClase) {
        material = await this.materialService.getMaterialPorClase(idClase);
      } else if (idModulo) {
        material = await this.materialService.getMaterialPorModulo(idModulo);
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'ID de clase o módulo requerido', statusCode: 400 },
        });
      }

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (error) {
      next(error);
    }
  }

  async buscar(req, res, next) {
    try {
      const { q, idClase } = req.query;

      if (!q || !idClase) {
        return res.status(400).json({
          success: false,
          error: { message: 'Búsqueda y clase requeridas', statusCode: 400 },
        });
      }

      const resultados = await this.materialService.buscar(q, idClase);

      res.status(200).json({
        success: true,
        data: resultados,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MaterialController;
