class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  isValid() {
    return this.name && this.email && this.password;
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}

module.exports = User;
