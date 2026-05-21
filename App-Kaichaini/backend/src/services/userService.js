const User = require('../models/User');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createUser(userData) {
    const user = new User(userData);

    if (!user.isValid()) {
      throw new Error('Datos de usuario inválidos');
    }

    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    return await this.userRepository.create(user);
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async updateUser(id, userData) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const updated = await this.userRepository.update(id, userData);
    if (!updated) {
      throw new Error('Error al actualizar usuario');
    }

    return await this.userRepository.findById(id);
  }

  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return await this.userRepository.delete(id);
  }
}

module.exports = UserService;
