class RespuestaController {
  constructor(respuestaService) {
    this.respuestaService = respuestaService;
  }

  async responder(req, res, next) {
    try {
      const { idEjercicio, respuesta } = req.body;
      const idEstudiante = req.user.id;

      if (!idEjercicio || !respuesta) {
        return res.status(400).json({
          success: false,
          error: { message: 'ID ejercicio y respuesta requeridos', statusCode: 400 },
        });
      }

      const resultado = await this.respuestaService.responder(
        idEstudiante,
        idEjercicio,
        respuesta
      );

      res.status(200).json({
        success: true,
        message: resultado.esCorrecta ? 'Respuesta correcta!' : 'Respuesta incorrecta',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistorial(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const { idModulo } = req.query;

      const historial = await this.respuestaService.getHistorial(
        idEstudiante,
        idModulo
      );

      res.status(200).json({
        success: true,
        data: historial,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvaluacionModulo(req, res, next) {
    try {
      const { idModulo } = req.params;
      const idEstudiante = req.user.id;

      const evaluacion = await this.respuestaService.getEvaluacionModulo(
        idEstudiante,
        idModulo
      );

      res.status(200).json({
        success: true,
        data: evaluacion,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RespuestaController;
