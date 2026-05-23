class MaterialService {
  constructor(materialRepository) {
    this.materialRepository = materialRepository;
  }

  async getMaterialPorClase(idClase) {
    // Obtener todo el material de una clase
    return await this.materialRepository.findByClase(idClase);
  }

  async getMaterialPorModulo(idModulo) {
    // Obtener material de un módulo específico
    return await this.materialRepository.findByModulo(idModulo);
  }

  async buscar(query, idClase) {
    // H.U. 408 - Buscar material por nombre
    // Acepta desde 1 carácter; prioriza exactas sobre parciales (ordenado en repository)
    if (!query || query.trim().length < 1) {
      throw new Error('Término de búsqueda requerido');
    }

    return await this.materialRepository.buscarPorNombre(query.trim(), idClase);
  }
}

module.exports = MaterialService;
