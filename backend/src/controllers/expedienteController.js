const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const expedienteService = require('../services/expedienteService');
const userRepo = require('../repositories/userRepository');
const { success, created } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, padronId } = req.query;
    const result = await expedienteService.getAll({ page: +page, limit: +limit, search, padronId });
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getByPadron = async (req, res, next) => {
  try {
    const expedientes = await expedienteService.getByPadron(req.params.padronId);
    return success(res, expedientes);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const exp = await expedienteService.getById(req.params.id);
    return success(res, exp);
  } catch (err) {
    next(err);
  }
};

const createValidation = [
  body('numero')
    .notEmpty()
    .matches(/^\d{4}-[A-Z]\d?-\d+$/)
    .withMessage('Formato inválido. Ej: 2024-E-12345, 2024-E1-12345, 2024-E2-12345'),
  body('padronId').isMongoId().withMessage('padronId inválido'),
  validate,
];

const create = async (req, res, next) => {
  try {
    const exp = await expedienteService.create(req.body);
    return created(res, exp, 'Expediente creado');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const exp = await expedienteService.update(req.params.id, req.body);
    return success(res, exp, 'Expediente actualizado');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await expedienteService.remove(req.params.id);
    return success(res, null, 'Expediente eliminado');
  } catch (err) {
    next(err);
  }
};

const authorizeValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  validate,
];

const authorizeUser = async (req, res, next) => {
  try {
    const user = await userRepo.findByEmail(req.body.email);
    if (!user) throw { status: 404, message: 'No existe un usuario con ese email' };
    if (!['PROFESIONAL', 'TECNICO'].includes(user.rol)) {
      throw { status: 400, message: 'Solo se pueden autorizar usuarios con rol PROFESIONAL o TECNICO' };
    }
    if (!user.activo) throw { status: 400, message: 'El usuario no está activo' };

    const exp = await expedienteService.authorizeUser(req.params.id, user._id);
    return success(res, exp, `${user.nombre} autorizado en el expediente`);
  } catch (err) {
    next(err);
  }
};

const deauthorizeUser = async (req, res, next) => {
  try {
    const exp = await expedienteService.deauthorizeUser(req.params.id, req.params.userId);
    return success(res, exp, 'Permiso removido');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getByPadron, getById, createValidation, create, update, remove, authorizeValidation, authorizeUser, deauthorizeUser };
