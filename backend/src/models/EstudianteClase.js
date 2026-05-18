class EstudianteClase {
  constructor(data = {}) {
    this.idEstudiante = data.idEstudiante || null;
    this.idClase = data.idClase || null;
    this.fechaIngreso = data.fechaIngreso || new Date();
  }

  isValid() {
    return this.idEstudiante && this.idClase;
  }

  toJSON() {
    return {
      idEstudiante: this.idEstudiante,
      idClase: this.idClase,
      fechaIngreso: this.fechaIngreso,
    };
  }
}

module.exports = EstudianteClase;
