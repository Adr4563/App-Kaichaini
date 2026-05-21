const ROLES = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
};

const LIGA_THRESHOLDS = {
  AMAUTA: { min: 0, max: 499, nombre: 'Amauta' },
  PANACA: { min: 500, max: 999, nombre: 'Panaca' },
  AUQUI: { min: 1000, max: 1999, nombre: 'Auqui' },
  INCA: { min: 2000, max: Infinity, nombre: 'Inca' },
};

const XP_POR_TIPO_EJERCICIO = {
  seleccion_multiple: 10,
  clic_imagen: 10,
  banco_palabras: 15,
  drag_drop: 15,
};

const XP_BONO_MODULO_COMPLETADO = 50;
const XP_INICIAL_ESTUDIANTE = 0;

const RETROALIMENTACION_THRESHOLDS = {
  EXCELENTE: { min: 0, max: 2, mensaje: 'Excelente desempeño, solo 1-2 errores' },
  BUENO: { min: 3, max: 5, mensaje: 'Buen desempeño, pero revisa los temas con errores' },
  NECESITA_MEJORA: { min: 6, max: Infinity, mensaje: 'Necesitas mejorar, repasa los conceptos clave' },
};

const ERROR_MESSAGES = {
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',
  EMAIL_DUPLICADO: 'El correo ya está registrado',
  CONTRASENA_INCORRECTA: 'Contraseña incorrecta',
  DATOS_INVALIDOS: 'Datos inválidos',
  TOKEN_INVALIDO: 'Token inválido o expirado',
  ACCESO_DENEGADO: 'Acceso denegado',
  CODIGO_VALIDACION_REQUERIDO: 'Código de validación requerido para docentes',
  CODIGO_VALIDACION_INVALIDO: 'Código de validación inválido',
};

const SUCCESS_MESSAGES = {
  USUARIO_CREADO: 'Usuario creado exitosamente',
  LOGIN_EXITOSO: 'Login exitoso',
  LOGOUT_EXITOSO: 'Logout exitoso',
};

const CUENTA_BLOQUEADA_MINUTOS = 15;
const MAX_INTENTOS_FALLIDOS = 5;

module.exports = {
  ROLES,
  LIGA_THRESHOLDS,
  XP_POR_TIPO_EJERCICIO,
  XP_BONO_MODULO_COMPLETADO,
  XP_INICIAL_ESTUDIANTE,
  RETROALIMENTACION_THRESHOLDS,
  CUENTA_BLOQUEADA_MINUTOS,
  MAX_INTENTOS_FALLIDOS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
