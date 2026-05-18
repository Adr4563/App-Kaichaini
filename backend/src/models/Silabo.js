class Silabo {
  constructor(data = {}) {
    this.id = data.id || null;
    this.idClase = data.idClase || null;
    this.archivoUrl = data.archivoUrl || '';
    this.fechaSubida = data.fechaSubida || new Date();
  }

  isValid() {
    return this.idClase && this.archivoUrl;
  }

  toJSON() {
    return {
      id: this.id,
      idClase: this.idClase,
      archivoUrl: this.archivoUrl,
      fechaSubida: this.fechaSubida,
    };
  }
}

module.exports = Silabo;
