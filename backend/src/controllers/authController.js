const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const authService = require('../services/authService');
const userRepo = require('../repositories/userRepository');
const { success, created, badRequest } = require('../utils/apiResponse');

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password requerido'),
  validate,
];

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password);
    return success(res, { token, user }, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await userRepo.create(req.body);
    return created(res, user, 'Usuario creado');
  } catch (err) {
    next(err);
  }
};

const registerValidation = [
  body('nombre').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('rol').isIn(['ADMIN', 'TECNICO', 'PROFESIONAL']),
  validate,
];

const getUsers = async (req, res, next) => {
  try {
    const users = await userRepo.findAll();
    return success(res, users);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, loginValidation, me, register, registerValidation, getUsers };
