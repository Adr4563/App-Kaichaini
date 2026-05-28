class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.contrasena = data.contrasena || '';
    this.rol = data.rol || null;
    this.avatar = data.avatar || null;
    this.tokenJWT = data.tokenJWT || null;
    this.fechaRegistro = data.fechaRegistro || new Date();
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
  }

  isValid() {
    return this.nombre && this.correo && this.contrasena;
  }

  toJSON() {
    const { contrasena, tokenJWT, ...user } = this;
    return user;
  }
}

module.exports = User;
