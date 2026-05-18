class Liga {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.umbralMinimo = data.umbralMinimo || 0;
    this.umbralMaximo = data.umbralMaximo || 100;
  }

  isValid() {
    return this.nombre && this.umbralMinimo !== undefined && this.umbralMaximo !== undefined;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      umbralMinimo: this.umbralMinimo,
      umbralMaximo: this.umbralMaximo,
    };
  }
}

module.exports = Liga;
