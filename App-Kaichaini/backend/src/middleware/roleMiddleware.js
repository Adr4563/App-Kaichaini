const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no autenticado',
          statusCode: 401,
        },
      });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Acceso denegado. Rol requerido: ' + rolesArray.join(', '),
          statusCode: 403,
        },
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
