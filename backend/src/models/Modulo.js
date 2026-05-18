class Modulo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.idClase = data.idClase || null;
    this.nombre = data.nombre || '';
    this.orden = data.orden || 1;
    this.bimestre = data.bimestre || 1;
    this.estado = data.estado || 'bloqueado';
  }

  isValid() {
    return this.idClase && this.nombre && this.orden && this.bimestre;
  }

  toJSON() {
    return {
      id: this.id,
      idClase: this.idClase,
      nombre: this.nombre,
      orden: this.orden,
      bimestre: this.bimestre,
      estado: this.estado,
    };
  }
}

module.exports = Modulo;
