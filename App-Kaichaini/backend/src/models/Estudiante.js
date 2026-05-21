class Estudiante {
  constructor(data = {}) {
    // Campos heredados de Usuario
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.contrasena = data.contrasena || '';
    this.avatar = data.avatar || null;
    this.tokenJWT = data.tokenJWT || null;
    this.rol = data.rol || 'Estudiante';
    this.codigoValidacion = data.codigoValidacion || null;
    this.fechaRegistro = data.fechaRegistro || new Date();

    // Campos específicos de Estudiante
    this.colorTema = data.colorTema || 'light';
    this.idLiga = data.idLiga || null;
    this.colegio = data.colegio || null;

    // Campos de seguridad
    this.intentosFallidos = data.intentosFallidos || 0;
    this.bloqueadoHasta = data.bloqueadoHasta || null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
  }

  isValid() {
    return this.nombre && this.correo && this.contrasena;
  }

  toJSON() {
    const { contrasena, tokenJWT, codigoValidacion, ...estudiante } = this;
    return estudiante;
  }
}

module.exports = Estudiante;
