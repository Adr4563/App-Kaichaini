class PerfilService {
  constructor(
    estudianteRepository,
    claseRepository,
    insigniaRepository,
    xpService,
    ligaRepository
  ) {
    this.estudianteRepository = estudianteRepository;
    this.claseRepository = claseRepository;
    this.insigniaRepository = insigniaRepository;
    this.xpService = xpService;
    this.ligaRepository = ligaRepository;
  }

  async getPerfilCompleto(idEstudiante) {
    // H.U. 017 - Obtener perfil completo del estudiante
    const usuario = await this.estudianteRepository.findById(idEstudiante);
    if (!usuario) {
      throw new Error('Estudiante no encontrado');
    }

    const xpTotal = await this.xpService.getXPTotal(idEstudiante);
    const liga = usuario.idLiga ? await this.ligaRepository.findById(usuario.idLiga) : null;
    const insignias = await this.insigniaRepository.findByEstudiante(idEstudiante);

    return {
      usuario: usuario.toJSON(),
      estadisticas: {
        xpTotal,
        liga: liga ? liga.toJSON() : null,
        insignias: insignias.map(i => i.toJSON()),
      },
    };
  }
}

module.exports = PerfilService;
