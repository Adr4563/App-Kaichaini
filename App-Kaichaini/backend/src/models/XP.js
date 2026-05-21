class XP {
  constructor(data = {}) {
    this.id = data.id || null;
    this.idEstudiante = data.idEstudiante || null;
    this.puntosTotal = data.puntosTotal || 0;
  }

  isValid() {
    return this.idEstudiante;
  }

  toJSON() {
    return {
      id: this.id,
      idEstudiante: this.idEstudiante,
      puntosTotal: this.puntosTotal,
    };
  }
}

module.exports = XP;
