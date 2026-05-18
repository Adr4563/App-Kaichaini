class InsigniaController {
  constructor(insigniaService) {
    this.insigniaService = insigniaService;
  }

  async getInsignias(req, res, next) {
    try {
      const insignias = await this.insigniaService.getInsignias();

      res.status(200).json({
        success: true,
        data: insignias.map(i => i.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMisInsignias(req, res, next) {
    try {
      const idEstudiante = req.user.id;
      const insignias = await this.insigniaService.getInsigniasByEstudiante(idEstudiante);

      res.status(200).json({
        success: true,
        data: insignias.map(i => i.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InsigniaController;
