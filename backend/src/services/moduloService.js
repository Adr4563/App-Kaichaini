const Modulo = require('../models/Modulo');
const { v4: uuidv4 } = require('uuid');

class ModuloService {
  constructor(moduloRepository) {
    this.moduloRepository = moduloRepository;
  }

  async createModulo(data) {
    if (!data.idClase || !data.nombre || !data.orden || !data.bimestre) {
      throw new Error('Datos incompletos para crear módulo');
    }

    const moduloData = {
      id: uuidv4(),
      idClase: data.idClase,
      nombre: data.nombre,
      orden: data.orden,
      bimestre: data.bimestre,
      estado: data.estado || 'bloqueado',
    };

    const modulo = new Modulo(moduloData);
    if (!modulo.isValid()) {
      throw new Error('Datos inválidos para crear módulo');
    }

    return await this.moduloRepository.create(modulo);
  }

  async getModulosByClaseBimestre(idClase, bimestre) {
    // H.U. 117 - Obtener módulos de una clase en un bimestre específico
    return await this.moduloRepository.findByClaseBimestre(idClase, bimestre);
  }

  async getModuloById(id) {
    const modulo = await this.moduloRepository.findById(id);
    if (!modulo) {
      throw new Error('Módulo no encontrado');
    }
    return modulo;
  }

  async desbloquearSiguiente(idModulo) {
    // H.U. 122 - Desbloquear el siguiente módulo después de completar uno
    const siguienteModulo = await this.moduloRepository.findSiguienteModulo(idModulo);

    if (siguienteModulo) {
      await this.moduloRepository.desbloquear(siguienteModulo.id);
      return siguienteModulo;
    }

    return null;
  }

  async updateModulo(id, data) {
    await this.getModuloById(id); // Verificar que existe
    return await this.moduloRepository.update(id, data);
  }

  async deleteModulo(id) {
    return await this.moduloRepository.delete(id);
  }
}

module.exports = ModuloService;
