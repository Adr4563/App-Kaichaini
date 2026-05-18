class ModuloController {
  constructor(moduloService) {
    this.moduloService = moduloService;
  }

  async getByClaseBimestre(req, res, next) {
    try {
      const { idClase, bimestre } = req.query;

      if (!idClase || !bimestre) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID de clase y bimestre son requeridos',
            statusCode: 400,
          },
        });
      }

      const modulos = await this.moduloService.getModulosByClaseBimestre(
        idClase,
        parseInt(bimestre)
      );

      res.status(200).json({
        success: true,
        data: modulos.map(m => m.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const modulo = await this.moduloService.getModuloById(id);

      res.status(200).json({
        success: true,
        data: modulo.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { nombre, orden, bimestre } = req.body;
      const idClase = req.params.idClase;

      const modulo = await this.moduloService.createModulo({
        idClase,
        nombre,
        orden,
        bimestre,
      });

      res.status(201).json({
        success: true,
        message: 'Módulo creado exitosamente',
        data: modulo.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, estado, orden } = req.body;

      await this.moduloService.updateModulo(id, { nombre, estado, orden });
      const moduloActualizado = await this.moduloService.getModuloById(id);

      res.status(200).json({
        success: true,
        message: 'Módulo actualizado exitosamente',
        data: moduloActualizado.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.moduloService.deleteModulo(id);

      res.status(200).json({
        success: true,
        message: 'Módulo eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ModuloController;
