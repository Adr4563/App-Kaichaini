require('dotenv').config();
const DatabaseConnection = require('./config/database');
const AppConfig = require('./config/app');
const ErrorHandler = require('./middleware/errorHandler');

// Importar repositorios
const UserRepository = require('./repositories/userRepository');

// Importar servicios
const UserService = require('./services/userService');

// Importar controladores
const UserController = require('./controllers/userController');

// Importar rutas
const UserRoutes = require('./routes/userRoutes');

async function startServer() {
  try {
    // 1. Conectar a la base de datos
    const db = new DatabaseConnection();
    await db.connect();

    // 2. Inyección de dependencias - Crear instancias
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);
    const userController = new UserController(userService);
    const userRoutes = new UserRoutes(userController);

    // 3. Configurar la aplicación Express
    const appConfig = new AppConfig();
    appConfig.configureMiddleware();

    // 4. Registrar rutas
    appConfig.registerRoutes([userRoutes.getRouter()]);

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
      console.log(`\n🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/health\n`);
    });

    // 9. Manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Cerrando servidor...');
      await db.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
