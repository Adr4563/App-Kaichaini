class ErrorHandler {
  static handle(err, req, res, next) {
    console.error(`[ERROR] ${err.message}`);

    const statusCode = err.statusCode || 500;
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
