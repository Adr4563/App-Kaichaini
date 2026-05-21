class LigaService {
  constructor(ligaRepository, xpRepository, estudianteRepository) {
    this.ligaRepository = ligaRepository;
    this.xpRepository = xpRepository;
    this.estudianteRepository = estudianteRepository;
  }

  async inicializarLigas() {
    // Ejecutar seed para crear las ligas iniciales si no existen
    await this.ligaRepository.seedLigas();
  }

  async getLigas() {
    // H.U. 120 - Obtener todas las ligas disponibles
    return await this.ligaRepository.findAll();
  }

  async getLigaByXP(xpTotal) {
    // H.U. 120 - Obtener la liga correspondiente a un rango de XP
    const liga = await this.ligaRepository.findByPuntos(xpTotal);
    if (!liga) {
      throw new Error('No se encontró liga para los puntos especificados');
    }
    return liga;
  }

  async actualizarLigaEstudiante(idEstudiante, xpTotal) {
    // H.U. 120 - Actualizar la liga del estudiante basado en su XP total
    const nuevaLiga = await this.getLigaByXP(xpTotal);

    // Actualizar el campo idLiga en la tabla USUARIO
    await this.estudianteRepository.update(idEstudiante, {
      idLiga: nuevaLiga.id,
    });

    return nuevaLiga;
  }

  async getRanking() {
    // Obtener ranking de estudiantes por XP (ligas)
    const ligas = await this.getLigas();
    const ranking = [];

    for (const liga of ligas) {
      // Aquí se podrían obtener estudiantes por liga
      ranking.push({
        liga: liga.toJSON(),
        estudiantes: [], // Implementar después
      });
    }

    return ranking;
  }
}

module.exports = LigaService;
