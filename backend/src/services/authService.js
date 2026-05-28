const Estudiante = require('../models/Estudiante');
const Docente = require('../models/Docente');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { validatePassword, validateEmail, validateNombre } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');
const { ROLES, XP_INICIAL_ESTUDIANTE, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

class AuthService {
  constructor(estudianteRepository, docenteRepository, xpRepository, ligaRepository) {
    this.estudianteRepository = estudianteRepository;
    this.docenteRepository = docenteRepository;
    this.xpRepository = xpRepository;
    this.ligaRepository = ligaRepository;
  }

  async registerEstudiante(userData) {
    // Validar nombre
    if (!validateNombre(userData.nombre)) {
      throw new Error('Nombre debe tener al menos 2 caracteres');
    }

    // Validar email
    if (!validateEmail(userData.correo)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña según H.U. 001
    const passwordValidation = validatePassword(userData.contrasena);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Verificar email único
    let existingUser = await this.estudianteRepository.findByEmail(userData.correo);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_DUPLICADO);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.contrasena);

    // Crear ID
    const id = uuidv4();

    // Crear estudiante con colegio (H.U. 001)
    const estudianteData = {
      id,
      nombre: userData.nombre,
      correo: userData.correo,
      contrasena: hashedPassword,
      rol: ROLES.ESTUDIANTE,
      avatar: userData.avatar || null,
      colegio: userData.colegio || null,
    };

    const estudiante = new Estudiante(estudianteData);

    if (!estudiante.isValid()) {
      throw new Error(ERROR_MESSAGES.DATOS_INVALIDOS);
    }

    const createdEstudiante = await this.estudianteRepository.create(estudiante);

    // Inicializar XP
    if (this.xpRepository) {
      await this.xpRepository.create({ idEstudiante: id, puntosTotal: XP_INICIAL_ESTUDIANTE });
    }

    // Asignar Liga inicial (Amauta a 0 XP)
    if (this.ligaRepository) {
      const ligaAmauta = await this.ligaRepository.findByPuntos(0);
      if (ligaAmauta) {
        await this.estudianteRepository.update(id, { idLiga: ligaAmauta.id });
      }
    }

    return createdEstudiante;
  }

  async registerDocente(userData) {
    // Validar nombre
    if (!validateNombre(userData.nombre)) {
      throw new Error('Nombre debe tener al menos 2 caracteres');
    }

    // Validar email
    if (!validateEmail(userData.correo)) {
      throw new Error('Email inválido');
    }

    // Validar contraseña
    const passwordValidation = validatePassword(userData.contrasena);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Verificar código de validación
    if (!userData.codigoValidacion || !userData.codigoValidacion.trim()) {
      throw new Error(ERROR_MESSAGES.CODIGO_VALIDACION_REQUERIDO);
    }

    // Verificar email único
    let existingUser = await this.docenteRepository.findByEmail(userData.correo);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_DUPLICADO);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.contrasena);

    // Crear ID
    const id = uuidv4();

    // Crear docente
    const docenteData = {
      id,
      nombre: userData.nombre,
      correo: userData.correo,
      contrasena: hashedPassword,
      rol: ROLES.DOCENTE,
      avatar: userData.avatar || null,
      codigoValidacion: userData.codigoValidacion,
    };

    const docente = new Docente(docenteData);

    if (!docente.isValid()) {
      throw new Error(ERROR_MESSAGES.DATOS_INVALIDOS);
    }

    const createdDocente = await this.docenteRepository.create(docente);

    return createdDocente;
  }

  async login(correo, contrasena) {
    // Buscar usuario (estudiante o docente)
    let usuario = await this.estudianteRepository.findByEmail(correo);
    let isEstudiante = !!usuario;

    if (!usuario) {
      usuario = await this.docenteRepository.findByEmail(correo);
    }

    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Comparar password
    const isPasswordValid = await comparePassword(contrasena, usuario.contrasena);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;

    // Generar JWT
    const payload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
    };

    const token = generateToken(payload);

    // Actualizar token en BD
    await repository.updateToken(usuario.id, token);

    return {
      token,
      usuario: usuario.toJSON(),
    };
  }

  async logout(userId, isEstudiante = true) {
    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    await repository.updateToken(userId, null);
    return true;
  }

  async getPerfil(userId) {
    let usuario = await this.estudianteRepository.findById(userId);

    if (!usuario) {
      usuario = await this.docenteRepository.findById(userId);
    }

    if (!usuario) {
      throw new Error(ERROR_MESSAGES.USUARIO_NO_ENCONTRADO);
    }

    return usuario.toJSON();
  }

  async updatePerfil(userId, datos) {
    // Buscar usuario
    let usuario = await this.estudianteRepository.findById(userId);
    let isEstudiante = !!usuario;

    if (!usuario) {
      usuario = await this.docenteRepository.findById(userId);
    }

    if (!usuario) {
      throw new Error(ERROR_MESSAGES.USUARIO_NO_ENCONTRADO);
    }

    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    const updated = await repository.update(userId, datos);

    if (updated) {
      return await repository.findById(userId);
    }

    throw new Error('Error al actualizar perfil');
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Buscar usuario
    let usuario = await this.estudianteRepository.findById(userId);
    let isEstudiante = !!usuario;

    if (!usuario) {
      usuario = await this.docenteRepository.findById(userId);
    }

    if (!usuario) {
      throw new Error(ERROR_MESSAGES.USUARIO_NO_ENCONTRADO);
    }

    // Verificar contraseña actual
    const isPasswordValid = await comparePassword(currentPassword, usuario.contrasena);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.CONTRASENA_INCORRECTA);
    }

    // Hash nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar
    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    await repository.update(userId, { contrasena: hashedPassword });

    return true;
  }

  async forgotPassword(correo) {
    // H.U. 008 - Recuperar Contraseña
    // Buscar usuario
    let usuario = await this.estudianteRepository.findByEmail(correo);
    let isEstudiante = !!usuario;

    if (!usuario) {
      usuario = await this.docenteRepository.findByEmail(correo);
    }

    if (!usuario) {
      throw new Error(ERROR_MESSAGES.USUARIO_NO_ENCONTRADO);
    }

    // Generar token de reset (UUID)
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en BD
    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    await repository.update(usuario.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    // TODO: Enviar email con enlace de reset (H.U. 008)
    // Por ahora, retornar el token para testing

    return {
      token: resetToken,
      message: 'Se ha enviado un enlace de recuperación a tu correo (stub - token retornado para testing)'
    };
  }

  async resetPassword(token, newPassword) {
    // H.U. 008 - Recuperar Contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Buscar por token en estudiantes y docentes
    let usuario = await this.estudianteRepository.findByResetToken(token);
    let isEstudiante = !!usuario;

    if (!usuario) {
      usuario = await this.docenteRepository.findByResetToken(token);
    }

    if (!usuario) {
      throw new Error('Token inválido o expirado');
    }

    // Verificar que el token no haya expirado
    if (usuario.resetPasswordExpires && new Date(usuario.resetPasswordExpires) < new Date()) {
      throw new Error('El token ha expirado. Solicita uno nuevo');
    }

    // Actualizar contraseña y limpiar token
    const hashedPassword = await hashPassword(newPassword);
    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    await repository.update(usuario.id, {
      contrasena: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return true;
  }
}

module.exports = AuthService;
