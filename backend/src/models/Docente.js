class Docente {
  constructor(data = {}) {
    // Campos heredados de Usuario
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.contrasena = data.contrasena || '';
    this.avatar = data.avatar || null;
    this.tokenJWT = data.tokenJWT || null;
    this.rol = data.rol || 'Docente';
    this.codigoValidacion = data.codigoValidacion || null;
    this.fechaRegistro = data.fechaRegistro || new Date();

    // Campos de seguridad
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
  }

  isValid() {
    return this.nombre && this.correo && this.contrasena && this.codigoValidacion;
  }

  toJSON() {
    const { contrasena, tokenJWT, ...docente } = this;
    return docente;
  }
}

module.exports = Docente;
