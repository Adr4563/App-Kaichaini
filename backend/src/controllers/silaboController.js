class SilaboController {
  constructor(silaboService) {
    this.silaboService = silaboService;
  }

  async getSilaboByClase(req, res, next) {
    try {
      const { idClase } = req.params;

      const silabo = await this.silaboService.getSilaboByClase(idClase);

      res.status(200).json({
        success: true,
        data: silabo.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SilaboController;
