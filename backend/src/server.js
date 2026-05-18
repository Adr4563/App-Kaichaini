require('dotenv').config();
const DatabaseConnection = require('./config/database');
const AppConfig = require('./config/app');
const ErrorHandler = require('./middleware/errorHandler');

// ===== REPOSITORIOS =====
const UserRepository = require('./repositories/userRepository');
const EstudianteRepository = require('./repositories/estudianteRepository');
const DocenteRepository = require('./repositories/docenteRepository');
const ClaseRepository = require('./repositories/claseRepository');
const EstudianteClaseRepository = require('./repositories/estudianteClaseRepository');
const LigaRepository = require('./repositories/ligaRepository');
const XPRepository = require('./repositories/xpRepository');
const ModuloRepository = require('./repositories/moduloRepository');
const EjercicioRepository = require('./repositories/ejercicioRepository');
const RespuestaRepository = require('./repositories/respuestaRepository');
const InsigniaRepository = require('./repositories/insigniaRepository');
const MaterialRepository = require('./repositories/materialRepository');
const SilaboRepository = require('./repositories/silaboRepository');

// ===== SERVICIOS =====
const UserService = require('./services/userService');
const AuthService = require('./services/authService');
const ClaseService = require('./services/claseService');
const LigaService = require('./services/ligaService');
const XPService = require('./services/xpService');
const ModuloService = require('./services/moduloService');
const EjercicioService = require('./services/ejercicioService');
const RespuestaService = require('./services/respuestaService');
const InsigniaService = require('./services/insigniaService');
const MaterialService = require('./services/materialService');
const SilaboService = require('./services/silaboService');
const ProgresoService = require('./services/progresoService');
const PerfilService = require('./services/perfilService');
const MapaService = require('./services/mapaService');

// ===== CONTROLADORES =====
const UserController = require('./controllers/userController');
const AuthController = require('./controllers/authController');
const ClaseController = require('./controllers/claseController');
const LigaController = require('./controllers/ligaController');
const XPController = require('./controllers/xpController');
const ModuloController = require('./controllers/moduloController');
const EjercicioController = require('./controllers/ejercicioController');
const RespuestaController = require('./controllers/respuestaController');
const InsigniaController = require('./controllers/insigniaController');
const MaterialController = require('./controllers/materialController');
const SilaboController = require('./controllers/silaboController');
const ProgresoController = require('./controllers/progresoController');
const PerfilController = require('./controllers/perfilController');
const MapaController = require('./controllers/mapaController');

// ===== RUTAS =====
const UserRoutes = require('./routes/userRoutes');
const AuthRoutes = require('./routes/authRoutes');
const ClaseRoutes = require('./routes/claseRoutes');
const LigaRoutes = require('./routes/ligaRoutes');
const XPRoutes = require('./routes/xpRoutes');
const ModuloRoutes = require('./routes/moduloRoutes');
const EjercicioRoutes = require('./routes/ejercicioRoutes');
const RespuestaRoutes = require('./routes/respuestaRoutes');
const InsigniaRoutes = require('./routes/insigniaRoutes');
const MaterialRoutes = require('./routes/materialRoutes');
const SilaboRoutes = require('./routes/silaboRoutes');
const ProgresoRoutes = require('./routes/progresoRoutes');
const PerfilRoutes = require('./routes/perfilRoutes');
const MapaRoutes = require('./routes/mapaRoutes');

async function startServer() {
  try {
    // 1. Conectar a la base de datos
    console.log('📡 Conectando a la base de datos...');
    const db = new DatabaseConnection();
    await db.connect();

    // 2. Inyección de dependencias - Crear instancias

    // USUARIOS (Usuario base)
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);
    const userRoutes = new UserRoutes(userController);

    // LIGA Y XP (se crean antes de AuthService que los necesita)
    const ligaRepository = new LigaRepository(db);
    const xpRepository = new XPRepository(db);

    // Inicializar ligas en la BD
    await ligaRepository.seedLigas();

    // AUTH (Estudiante, Docente, Login, Registro)
    const estudianteRepository = new EstudianteRepository(db);
    const docenteRepository = new DocenteRepository(db);

    const authService = new AuthService(
      estudianteRepository,
      docenteRepository,
      xpRepository,
      ligaRepository
    );
    const authController = new AuthController(authService);
    const authRoutes = new AuthRoutes(authController);

    // LIGA SERVICE (necesita estudiante repo para actualizar)
    const ligaService = new LigaService(ligaRepository, xpRepository, estudianteRepository);
    const ligaController = new LigaController(ligaService);
    const ligaRoutes = new LigaRoutes(ligaController);

    // XP SERVICE
    const xpService = new XPService(xpRepository, ligaService);
    const xpController = new XPController(xpService);
    const xpRoutes = new XPRoutes(xpController);

    // CLASES
    const claseRepository = new ClaseRepository(db);
    const estudianteClaseRepository = new EstudianteClaseRepository(db);
    const claseService = new ClaseService(claseRepository, estudianteClaseRepository);
    const claseController = new ClaseController(claseService);
    const claseRoutes = new ClaseRoutes(claseController);

    // MODULO
    const moduloRepository = new ModuloRepository(db);
    const moduloService = new ModuloService(moduloRepository);
    const moduloController = new ModuloController(moduloService);
    const moduloRoutes = new ModuloRoutes(moduloController);

    // EJERCICIO
    const ejercicioRepository = new EjercicioRepository(db);
    const respuestaRepository = new RespuestaRepository(db);
    const ejercicioService = new EjercicioService(ejercicioRepository, respuestaRepository);
    const ejercicioController = new EjercicioController(ejercicioService);
    const ejercicioRoutes = new EjercicioRoutes(ejercicioController);

    // INSIGNIA
    const insigniaRepository = new InsigniaRepository(db);
    const insigniaService = new InsigniaService(
      insigniaRepository,
      respuestaRepository,
      ejercicioRepository
    );
    const insigniaController = new InsigniaController(insigniaService);
    const insigniaRoutes = new InsigniaRoutes(insigniaController);

    // RESPUESTA (Core - necesita muchos servicios)
    const respuestaService = new RespuestaService(
      respuestaRepository,
      ejercicioRepository,
      moduloRepository,
      xpService,
      ligaService,
      insigniaService
    );
    const respuestaController = new RespuestaController(respuestaService);
    const respuestaRoutes = new RespuestaRoutes(respuestaController);

    // PROGRESO
    const progresoService = new ProgresoService(
      ejercicioRepository,
      respuestaRepository,
      moduloRepository,
      claseRepository
    );
    const progresoController = new ProgresoController(progresoService);
    const progresoRoutes = new ProgresoRoutes(progresoController);

    // MATERIAL
    const materialRepository = new MaterialRepository(db);
    const materialService = new MaterialService(materialRepository);
    const materialController = new MaterialController(materialService);
    const materialRoutes = new MaterialRoutes(materialController);

    // SILABO
    const silaboRepository = new SilaboRepository(db);
    const silaboService = new SilaboService(silaboRepository);
    const silaboController = new SilaboController(silaboService);
    const silaboRoutes = new SilaboRoutes(silaboController);

    // PERFIL
    const perfilService = new PerfilService(
      estudianteRepository,
      claseRepository,
      insigniaRepository,
      xpService,
      ligaRepository
    );
    const perfilController = new PerfilController(perfilService);
    const perfilRoutes = new PerfilRoutes(perfilController);

    // MAPA
    const mapaService = new MapaService(
      claseRepository,
      estudianteClaseRepository,
      moduloRepository,
      progresoService,
      xpService
    );
    const mapaController = new MapaController(mapaService);
    const mapaRoutes = new MapaRoutes(mapaController);

    // 3. Configurar la aplicación Express
    console.log('⚙️  Configurando Express...');
    const appConfig = new AppConfig();
    appConfig.configureMiddleware();

    // 4. Registrar rutas
    console.log('🛣️  Registrando rutas...');
    appConfig.registerRoutes([
      userRoutes.getRouter(),
      authRoutes.getRouter(),
      claseRoutes.getRouter(),
      ligaRoutes.getRouter(),
      xpRoutes.getRouter(),
      moduloRoutes.getRouter(),
      ejercicioRoutes.getRouter(),
      respuestaRoutes.getRouter(),
      insigniaRoutes.getRouter(),
      materialRoutes.getRouter(),
      silaboRoutes.getRouter(),
      progresoRoutes.getRouter(),
      perfilRoutes.getRouter(),
      mapaRoutes.getRouter(),
    ]);

    // 5. Configurar manejador de errores
    appConfig.configureErrorHandler(ErrorHandler.handle);

    // 6. Obtener la aplicación
    const app = appConfig.getApp();

    // 7. Ruta de salud
    app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Servidor funcionando correctamente',
      });
    });

    // 8. Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🔐 Auth Register: POST http://localhost:${PORT}/api/v1/auth/register`);
      console.log(`🔐 Auth Login: POST http://localhost:${PORT}/api/v1/auth/login`);
      console.log(`${'='.repeat(50)}\n`);
    });

    // 9. Manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Cerrando servidor...');
      await db.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

startServer();
