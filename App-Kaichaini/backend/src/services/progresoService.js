class ProgresoService {
  constructor(
    ejercicioRepository,
    respuestaRepository,
    moduloRepository,
    claseRepository
  ) {
    this.ejercicioRepository = ejercicioRepository;
    this.respuestaRepository = respuestaRepository;
    this.moduloRepository = moduloRepository;
    this.claseRepository = claseRepository;
  }

  async getProgresoModulo(idEstudiante, idModulo) {
    // H.U. 123 - Obtener progreso en un módulo específico
    const modulo = await this.moduloRepository.findById(idModulo);
    if (!modulo) {
      throw new Error('Módulo no encontrado');
    }

    const totalEjercicios = await this.ejercicioRepository.contarByModulo(idModulo);
    const correctas = await this.respuestaRepository.contarCorrectasPorModulo(
      idEstudiante,
      idModulo
    );

    const porcentajeAciertos = totalEjercicios > 0 ? (correctas / totalEjercicios) * 100 : 0;

    return {
      idModulo,
      nombre: modulo.nombre,
      totalEjercicios,
      ejerciciosCompletados: correctas,
      porcentajeAciertos: Math.round(porcentajeAciertos * 100) / 100,
      estado: modulo.estado,
    };
  }

  async getProgresoClase(idEstudiante, idClase) {
    // H.U. 117, 123 - Obtener progreso de todos los módulos de una clase
    const clase = await this.claseRepository.findById(idClase);
    if (!clase) {
      throw new Error('Clase no encontrada');
    }

    const modulos = await this.moduloRepository.findByClase(idClase);
    const progresosModulos = [];

    let totalEjerciciosClase = 0;
    let totalCorrectasClase = 0;

    for (const modulo of modulos) {
      const progreso = await this.getProgresoModulo(idEstudiante, modulo.id);
      progresosModulos.push(progreso);
      totalEjerciciosClase += progreso.totalEjercicios;
      totalCorrectasClase += progreso.ejerciciosCompletados;
    }

    const porcentajeAciertosClase =
      totalEjerciciosClase > 0 ? (totalCorrectasClase / totalEjerciciosClase) * 100 : 0;

    return {
      idClase,
      nombreClase: clase.nombre,
      modulos: progresosModulos,
      totalEjercicios: totalEjerciciosClase,
      ejerciciosCompletados: totalCorrectasClase,
      porcentajeAciertos: Math.round(porcentajeAciertosClase * 100) / 100,
    };
  }

  async getProgresoAllClases(idEstudiante, clases) {
    // Obtener progreso en todas las clases del estudiante
    const progresosClases = [];

    for (const clase of clases) {
      const progreso = await this.getProgresoClase(idEstudiante, clase.idClase);
      progresosClases.push(progreso);
    }

    return progresosClases;
  }
}

module.exports = ProgresoService;
