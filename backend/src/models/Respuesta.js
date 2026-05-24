class Respuesta {
  constructor(data = {}) {
    this.id           = data.id           || null;
    this.idEstudiante = data.idEstudiante || null;
    this.idEjercicio  = data.idEjercicio  || null;
    this.respuesta    = data.respuesta    || '';
    this.esCorrecta   = data.esCorrecta   ?? false;
    this.fecha        = data.fechaRespuesta || data.fecha || new Date();
    // Campos extra del JOIN con ejercicio (solo en historial)
    this.enunciado    = data.enunciado    || null;
    this.tipo         = data.tipo         || null;
  }

  isValid() {
    return this.idEstudiante && this.idEjercicio && this.respuesta !== undefined;
  }

  toJSON() {
    return {
      id:           this.id,
      idEstudiante: this.idEstudiante,
      idEjercicio:  this.idEjercicio,
      respuesta:    this.respuesta,
      esCorrecta:   this.esCorrecta,
      fecha:        this.fecha,
    };
  }
}

module.exports = Respuesta;
