class LigaController {
  constructor(ligaService) {
    this.ligaService = ligaService;
  }

  async getLigas(req, res, next) {
    try {
      const ligas = await this.ligaService.getLigas();

      res.status(200).json({
        success: true,
        data: ligas.map(liga => liga.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRanking(req, res, next) {
    try {
      const ranking = await this.ligaService.getRanking();

      res.status(200).json({
        success: true,
        data: ranking,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LigaController;
