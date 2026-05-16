const Validators = require('../utils/validators');

class ValidateRequest {
  static validateUser(req, res, next) {
    const { name, email, password } = req.body;

    const validation = Validators.validateUser({
      name,
      email,
      password,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validación fallida',
          errors: validation.errors,
        },
      });
    }

    next();
  }

  static validateUserUpdate(req, res, next) {
    const { name, email } = req.body;

    const errors = [];

    if (name && !Validators.isValidName(name)) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (email && !Validators.isEmail(email)) {
      errors.push('El correo electrónico no es válido');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validación fallida',
          errors,
        },
      });
    }

    next();
  }
}

module.exports = ValidateRequest;
