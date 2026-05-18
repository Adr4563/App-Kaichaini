class MapaService {
  constructor(
    claseRepository,
    estudianteClaseRepository,
    moduloRepository,
    progresoService,
    xpService
  ) {
    this.claseRepository = claseRepository;
    this.estudianteClaseRepository = estudianteClaseRepository;
    this.moduloRepository = moduloRepository;
    this.progresoService = progresoService;
    this.xpService = xpService;
  }

  async getMapaCompleto(idEstudiante) {
    // H.U. 117 - Obtener mapa de aprendizaje completo del estudiante
    const estudianteClases = await this.estudianteClaseRepository.findByEstudiante(
      idEstudiante
    );

    const clases = [];

    for (const ec of estudianteClases) {
      const clase = await this.claseRepository.findById(ec.idClase);
      if (clase) {
        const progreso = await this.progresoService.getProgresoClase(idEstudiante, clase.id);
        const xpEnClase = await this.xpService.getXPPorClase(idEstudiante, clase.id);

        clases.push({
          clase: clase.toJSON(),
          progreso,
          xpEnClase,
          fechaIngreso: ec.fechaIngreso,
        });
      }
    }

    return {
      idEstudiante,
      clases,
      timestamp: new Date(),
    };
  }

  async getMapaClaseByBimestre(idEstudiante, idClase, bimestre) {
    // H.U. 117 - Obtener módulos de una clase en un bimestre específico
    const clase = await this.claseRepository.findById(idClase);
    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    const modulos = await this.moduloRepository.findByClaseBimestre(idClase, bimestre);

    const modulosConProgreso = [];
    for (const modulo of modulos) {
      const progreso = await this.progresoService.getProgresoModulo(idEstudiante, modulo.id);
      modulosConProgreso.push({
        modulo: modulo.toJSON(),
        progreso,
      });
    }

    return {
      clase: clase.toJSON(),
      bimestre,
      modulos: modulosConProgreso,
    };
  }
}

module.exports = MapaService;
