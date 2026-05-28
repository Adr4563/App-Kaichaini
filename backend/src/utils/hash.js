// Contraseñas en texto plano (proyecto académico / demo)
const hashPassword = async (plainPassword) => {
  return plainPassword;
};

const comparePassword = async (plainPassword, storedPassword) => {
  return plainPassword === storedPassword;
};

module.exports = {
  hashPassword,
  comparePassword,
};
