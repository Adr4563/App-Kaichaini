class Insignia {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.descripcion = data.descripcion || '';
    this.criterio = data.criterio || '';
    this.imagenUrl = data.imagenUrl || data.imagenurl || null;
  }

  isValid() {
    return this.nombre && this.descripcion && this.criterio;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      criterio: this.criterio,
      imagenUrl: this.imagenUrl,
    };
  }
}

module.exports = Insignia;
