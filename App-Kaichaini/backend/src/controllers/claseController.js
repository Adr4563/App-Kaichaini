class ClaseController {
  constructor(claseService) {
    this.claseService = claseService;
  }

  async create(req, res, next) {
    try {
      const { nombre, codigoUnico, curso } = req.body;
      const idDocente = req.user.id;

      const clase = await this.claseService.createClase({
        nombre,
        codigoUnico,
        curso,
        idDocente,
      });

      res.status(201).json({
        success: true,
        message: 'Clase creada exitosamente',
        data: clase.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async validarCodigo(req, res, next) {
    try {
      const { codigo } = req.body;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Código de clase requerido',
            statusCode: 400,
          },
        });
      }

      const clase = await this.claseService.validarCodigoClase(codigo);

      res.status(200).json({
        success: true,
        message: 'Código válido',
        data: clase.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async unirse(req, res, next) {
    try {
      const { codigoUnico } = req.body;
      const idEstudiante = req.user.id;

      if (!codigoUnico) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Código de clase requerido',
            statusCode: 400,
          },
        });
      }

      await this.claseService.unirseAClase(idEstudiante, codigoUnico);

      res.status(200).json({
        success: true,
        message: 'Te has unido a la clase exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMisClases(req, res, next) {
    try {
      const idEstudiante = req.user.id;

      const clases = await this.claseService.getMisClases(idEstudiante);

      res.status(200).json({
        success: true,
        data: clases,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const clase = await this.claseService.getClaseById(id);

      res.status(200).json({
        success: true,
        data: clase.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getEstudiantes(req, res, next) {
    try {
      const { id } = req.params;

      const estudiantes = await this.claseService.getEstudiantesByClase(id);

      res.status(200).json({
        success: true,
        data: estudiantes,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, codigoUnico, curso } = req.body;

      await this.claseService.updateClase(id, {
        nombre,
        codigoUnico,
        curso,
      });

      const claseActualizada = await this.claseService.getClaseById(id);

      res.status(200).json({
        success: true,
        message: 'Clase actualizada exitosamente',
        data: claseActualizada.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.claseService.deleteClase(id);

      res.status(200).json({
        success: true,
        message: 'Clase eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async abandonar(req, res, next) {
    try {
      const { idClase } = req.body;
      const idEstudiante = req.user.id;

      if (!idClase) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ID de clase requerido',
            statusCode: 400,
          },
        });
      }

      await this.claseService.abandonarClase(idEstudiante, idClase);

      res.status(200).json({
        success: true,
        message: 'Has abandonado la clase exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClaseController;
