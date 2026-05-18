class Material {
  constructor(data = {}) {
    this.id = data.id || null;
    this.idClase = data.idClase || null;
    this.idModulo = data.idModulo || null;
    this.nombre = data.nombre || '';
    this.archivoUrl = data.archivoUrl || '';
    this.tipo = data.tipo || 'pdf';
  }

  isValid() {
    return this.nombre && this.archivoUrl && (this.idClase || this.idModulo);
  }

  toJSON() {
    return {
      id: this.id,
      idClase: this.idClase,
      idModulo: this.idModulo,
      nombre: this.nombre,
      archivoUrl: this.archivoUrl,
      tipo: this.tipo,
    };
  }
}

module.exports = Material;
