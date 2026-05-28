class ErrorHandler {
  // Mapa de mensajes conocidos → código HTTP apropiado
  static #statusMap = {
    'Credenciales inválidas':         401,
    'Token inválido':                 401,
    'Token expirado':                 401,
    'No autorizado':                  401,
    'Token inválido o expirado':      401,
    'El token ha expirado':           401,
    'No tienes permiso':              403,
    'Acceso denegado':                403,
    'No encontrado':                  404,
    'Usuario no encontrado':          404,
  };

  static handle(err, req, res, next) {
    console.error(`[ERROR] ${err.message}`);

    // Respetar statusCode explícito, luego buscar en el mapa, luego 500
    let statusCode = err.statusCode || 500;
    if (statusCode === 500) {
      const msg = err.message || '';
      for (const [pattern, code] of Object.entries(ErrorHandler.#statusMap)) {
        if (msg.includes(pattern)) { statusCode = code; break; }
      }
    }

    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
      },
    });
  }
}

module.exports = ErrorHandler;
