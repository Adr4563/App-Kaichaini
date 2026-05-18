const Estudiante = require('../models/Estudiante');
const Docente = require('../models/Docente');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { validatePassword, validateEmail, validateNombre } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');
const { ROLES, XP_INICIAL_ESTUDIANTE, ERROR_MESSAGES, SUCCESS_MESSAGES, CUENTA_BLOQUEADA_MINUTOS, MAX_INTENTOS_FALLIDOS } = require('../utils/constants');

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
      colorTema: userData.colorTema || 'light',
      colegio: userData.colegio || null,
      intentosFallidos: 0,
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
      intentosFallidos: 0,
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

    // Verificar si cuenta está bloqueada (H.U. 001 - Bloqueo por intentos fallidos)
    if (usuario.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date()) {
      throw new Error('Cuenta bloqueada por demasiados intentos. Intenta en 15 minutos');
    }

    // Comparar password
    const isPasswordValid = await comparePassword(contrasena, usuario.contrasena);
    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
      const intentosFallidos = (usuario.intentosFallidos || 0) + 1;

      if (intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
        // Bloquear cuenta por 15 minutos
        const bloqueadoHasta = new Date(Date.now() + CUENTA_BLOQUEADA_MINUTOS * 60 * 1000);
        await repository.update(usuario.id, {
          intentosFallidos,
          bloqueadoHasta
        });
        throw new Error('Cuenta bloqueada por demasiados intentos. Intenta en 15 minutos');
      } else {
        await repository.update(usuario.id, { intentosFallidos });
      }

      throw new Error('Credenciales inválidas');
    }

    // Resetear intentos fallidos en login exitoso
    const repository = isEstudiante ? this.estudianteRepository : this.docenteRepository;
    await repository.update(usuario.id, {
      intentosFallidos: 0,
      bloqueadoHasta: null
    });

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
    // Validar contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Buscar usuario por token
    // Nota: En producción, implementar método findByResetToken en repositories
    // Por ahora, hacer búsqueda manual (esto debería optimizarse)
    let usuario = null;
    let isEstudiante = true;
    let repository = this.estudianteRepository;

    // Búsqueda simple: iterar estudiantes (NOT OPTIMAL - for demo only)
    // En producción, implementar query paramétrica en BD
    throw new Error('resetPassword: Método debe ser implementado con query paramétrica en BD');
  }
}

module.exports = AuthService;
