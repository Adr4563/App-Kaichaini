class ProgresoModulo {
  constructor(data = {}) {
    this.idEstudiante = data.idEstudiante || null;
    this.idModulo = data.idModulo || null;
    this.ejerciciosCompletados = data.ejerciciosCompletados || 0;
    this.totalEjercicios = data.totalEjercicios || 0;
    this.porcentajeAvance = data.porcentajeAvance || 0;
    this.porcentajeAciertos = data.porcentajeAciertos || 0;
    this.estado = data.estado || 'en_progreso';
  }

  isValid() {
    return this.idEstudiante && this.idModulo;
  }

  toJSON() {
    return {
      idEstudiante: this.idEstudiante,
      idModulo: this.idModulo,
      ejerciciosCompletados: this.ejerciciosCompletados,
      totalEjercicios: this.totalEjercicios,
      porcentajeAvance: this.porcentajeAvance,
      porcentajeAciertos: this.porcentajeAciertos,
      estado: this.estado,
    };
  }
}

module.exports = ProgresoModulo;
