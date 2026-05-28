class Clase {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.codigoUnico = data.codigoUnico || '';
    this.curso = data.curso || '';
    this.idDocente = data.idDocente || null;
  }

  isValid() {
    return this.nombre && this.codigoUnico && this.curso && this.idDocente;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      codigoUnico: this.codigoUnico,
      curso: this.curso,
      idDocente: this.idDocente,
    };
  }
}

module.exports = Clase;
