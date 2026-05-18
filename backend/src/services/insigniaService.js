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

    for (const insignia of insignias) {
      const nombreInsignia = insignia.nombre.toLowerCase();
      let debeDesbloquearse = false;

      // Verificar si ya tiene la insignia
      const yaLaTiene = await this.insigniaRepository.hasInsignia(idEstudiante, insignia.id);
      if (yaLaTiene) continue;

      if (nombreInsignia.includes('primer') && nombreInsignia.includes('ejercicio')) {
        // "Primer Ejercicio Correcto"
        debeDesbloquearse = contexto.primerEjercicioCorrecto === true;
      } else if (nombreInsignia.includes('primer') && nombreInsignia.includes('modulo')) {
        // "Primer Módulo Completado"
        debeDesbloquearse = contexto.primerModuloCompletado === true;
      } else if (nombreInsignia.includes('cien')) {
        // "Cien Ejercicios"
        debeDesbloquearse = contexto.cienEjercicios === true;
      } else if (nombreInsignia.includes('perfecto') || nombreInsignia.includes('perfecta')) {
        // "Nota Perfecta"
        debeDesbloquearse = contexto.notaPerfecta === true;
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
