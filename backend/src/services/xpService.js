class XPService {
  constructor(xpRepository, ligaService) {
    this.xpRepository = xpRepository;
    this.ligaService = ligaService;
  }

  async getXPTotal(idEstudiante) {
    // Obtener XP total del estudiante
    const xpRecord = await this.xpRepository.findByEstudiante(idEstudiante);
    if (!xpRecord) {
      throw new Error('Estudiante no encontrado');
    }
    return xpRecord.puntosTotal;
  }

  async getXPPorClase(idEstudiante, idClase) {
    // H.U. 302 - Obtener XP acumulado en una clase específica
    return await this.xpRepository.getXPPorClase(idEstudiante, idClase);
  }

  async otorgarXP(idEstudiante, puntos) {
    // Otorgar XP al estudiante y retornar el nuevo total
    const xpActualizado = await this.xpRepository.otorgar(idEstudiante, puntos);

    if (!xpActualizado) {
      throw new Error('Error al otorgar XP');
    }

    return xpActualizado.puntosTotal;
  }

  async otorgarYActualizarLiga(idEstudiante, puntos) {
    // Otorgar XP y actualizar la liga del estudiante
    const nuevoXPTotal = await this.otorgarXP(idEstudiante, puntos);

    // Actualizar la liga basada en el nuevo XP total
    const nuevaLiga = await this.ligaService.actualizarLigaEstudiante(
      idEstudiante,
      nuevoXPTotal
    );

    return {
      xpTotal: nuevoXPTotal,
      liga: nuevaLiga,
    };
  }
}

module.exports = XPService;
