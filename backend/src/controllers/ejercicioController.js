class EjercicioController {
  constructor(ejercicioService) {
    this.ejercicioService = ejercicioService;
  }

  async getByModulo(req, res, next) {
    try {
      const { idModulo } = req.query;
      const idEstudiante = req.user.id;

      if (!idModulo) {
        return res.status(400).json({
          success: false,
          error: { message: 'ID de módulo requerido', statusCode: 400 },
        });
      }

      const ejercicios = await this.ejercicioService.getEjerciciosByModulo(
        idModulo,
        idEstudiante
      );

      res.status(200).json({
        success: true,
        data: ejercicios,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const ejercicio = await this.ejercicioService.getEjercicioById(id);

      res.status(200).json({
        success: true,
        data: ejercicio.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { idModulo, tipo, enunciado, respuestaCorrecta } = req.body;

      const ejercicio = await this.ejercicioService.createEjercicio({
        idModulo,
        tipo,
        enunciado,
        respuestaCorrecta,
      });

      res.status(201).json({
        success: true,
        message: 'Ejercicio creado exitosamente',
        data: ejercicio.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo, enunciado, respuestaCorrecta } = req.body;

      await this.ejercicioService.updateEjercicio(id, {
        tipo,
        enunciado,
        respuestaCorrecta,
      });

      const ejercicioActualizado = await this.ejercicioService.getEjercicioById(id);

      res.status(200).json({
        success: true,
        message: 'Ejercicio actualizado',
        data: ejercicioActualizado.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.ejercicioService.deleteEjercicio(id);

      res.status(200).json({
        success: true,
        message: 'Ejercicio eliminado',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EjercicioController;
