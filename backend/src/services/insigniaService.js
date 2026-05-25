class InsigniaService {
  constructor(insigniaRepository, respuestaRepository, ejercicioRepository) {
    this.insigniaRepository = insigniaRepository;
    this.respuestaRepository = respuestaRepository;
    this.ejercicioRepository = ejercicioRepository;
  }

  async getInsignias() {
    // H.U. 109 - Obtener todas las insignias disponibles
    return await this.insigniaRepository.findAll();
  }

  async getInsigniasByEstudiante(idEstudiante) {
    // H.U. 118 - Obtener insignias del estudiante
    return await this.insigniaRepository.findByEstudiante(idEstudiante);
  }

  async verificarYDesbloquear(idEstudiante, contexto) {
    // H.U. 109 - Verificar criterios y desbloquear insignias
    const insigniasDesbloqueadas = [];
    const insignias = await this.getInsignias();
    const totalCorrectas = contexto.totalCorrectasGlobal ?? 0;
    const xpTotal        = contexto.xpTotal ?? 0;

    for (const insignia of insignias) {
      const yaLaTiene = await this.insigniaRepository.hasInsignia(idEstudiante, insignia.id);
      if (yaLaTiene) continue;

      let debeDesbloquearse = false;
      const criterio = (insignia.criterio || '').toLowerCase();

      switch (criterio) {
        case 'primer_modulo':
          debeDesbloquearse = contexto.primerModuloCompletado === true;
          break;
        case 'ejercicios_5':
          debeDesbloquearse = totalCorrectas >= 5;
          break;
        case 'ejercicios_10':
          debeDesbloquearse = totalCorrectas >= 10;
          break;
        case 'ejercicios_20':
          debeDesbloquearse = totalCorrectas >= 20;
          break;
        case 'ejercicios_30':
          debeDesbloquearse = totalCorrectas >= 30;
          break;
        case '100_ejercicios':
          debeDesbloquearse = totalCorrectas >= 100;
          break;
        case 'xp_500':
          debeDesbloquearse = xpTotal >= 500;
          break;
        default:
          // Fallback por nombre para insignias sin criterio definido
          {
            const n = insignia.nombre.toLowerCase();
            if (n.includes('primer') && n.includes('ejercicio'))
              debeDesbloquearse = contexto.primerEjercicioCorrecto === true;
            else if (n.includes('perfecto') || n.includes('perfecta'))
              debeDesbloquearse = contexto.notaPerfecta === true;
          }
      }

      if (debeDesbloquearse) {
        await this.insigniaRepository.desbloquear(idEstudiante, insignia.id);
        insigniasDesbloqueadas.push(insignia.toJSON());
      }
    }

    return insigniasDesbloqueadas;
  }
}

module.exports = InsigniaService;
