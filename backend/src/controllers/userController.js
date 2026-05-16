class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async create(req, res, next) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users.map(user => user.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
