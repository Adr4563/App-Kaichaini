// Validación de contraseña según H.U. 001: mínimo 8 caracteres, 1 mayúscula, 1 número
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Contraseña requerida' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Contraseña debe tener al menos 8 caracteres' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Contraseña debe contener al menos una letra mayúscula' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Contraseña debe contener al menos un número' };
  }

  return { valid: true, message: 'Contraseña válida' };
};

// Validación de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de nombre (no vacío, 2+ caracteres)
const validateNombre = (nombre) => {
  return nombre && typeof nombre === 'string' && nombre.trim().length >= 2;
};

module.exports = {
  validatePassword,
  validateEmail,
  validateNombre,
};
