class Validators {
  static isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  static isValidName(name) {
    return name && name.trim().length >= 3;
  }

  static validateUser(userData) {
    const errors = [];

    if (!this.isValidName(userData.name)) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!this.isEmail(userData.email)) {
      errors.push('El correo electrónico no es válido');
    }

    if (!this.isValidPassword(userData.password)) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Validators;
