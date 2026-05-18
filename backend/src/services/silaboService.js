class SilaboService {
  constructor(silaboRepository) {
    this.silaboRepository = silaboRepository;
  }

  async getSilaboByClase(idClase) {
    // H.U. 401 - Obtener silabo descargable de una clase
    const silabo = await this.silaboRepository.findByClase(idClase);

    if (!silabo) {
      throw new Error('Silabo no encontrado para esta clase');
    }

    return silabo;
  }
}

module.exports = SilaboService;
