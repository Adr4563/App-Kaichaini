class Ejercicio {
  constructor(data = {}) {
    this.id = data.id || null;
    this.idModulo = data.idModulo || null;
    this.tipo = data.tipo || 'seleccion_multiple';
    this.enunciado = data.enunciado || '';
    this.respuestaCorrecta = data.respuestaCorrecta || '';
  }

  isValid() {
    return this.idModulo && this.enunciado && this.respuestaCorrecta;
  }

  toJSON() {
    const { respuestaCorrecta, ...ejercicio } = this;
    return ejercicio;
  }
}

module.exports = Ejercicio;
