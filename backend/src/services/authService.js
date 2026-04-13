const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const userRepo = require('../repositories/userRepository');

const login = async (email, password) => {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.activo) throw { status: 401, message: 'Credenciales inválidas' };

  const valid = await user.comparePassword(password);
  if (!valid) throw { status: 401, message: 'Credenciales inválidas' };

  const token = jwt.sign(
    { id: user._id, rol: user.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, user: user.toJSON() };
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const getProfile = (id) => userRepo.findById(id);

module.exports = { login, verifyToken, getProfile };
