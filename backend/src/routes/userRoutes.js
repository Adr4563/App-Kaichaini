const express = require('express');

class UserRoutes {
  constructor(userController) {
    this.userController = userController;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/users', (req, res, next) =>
      this.userController.create(req, res, next)
    );

    this.router.get('/users', (req, res, next) =>
      this.userController.getAll(req, res, next)
    );

    this.router.get('/users/:id', (req, res, next) =>
      this.userController.getById(req, res, next)
    );

    this.router.put('/users/:id', (req, res, next) =>
      this.userController.update(req, res, next)
    );

    this.router.delete('/users/:id', (req, res, next) =>
      this.userController.delete(req, res, next)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = UserRoutes;
