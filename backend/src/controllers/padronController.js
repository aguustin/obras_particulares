const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validate');
const padronService = require('../services/padronService');
const { success, created } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await padronService.getAll({ page: +page, limit: +limit, search });
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const padron = await padronService.getById(req.params.id);
    return success(res, padron);
  } catch (err) {
    next(err);
  }
};

const createValidation = [
  body('numero').notEmpty().withMessage('Número requerido'),
  validate,
];

const create = async (req, res, next) => {
  try {
    const padron = await padronService.create(req.body);
    return created(res, padron, 'Padrón creado');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const padron = await padronService.update(req.params.id, req.body);
    return success(res, padron, 'Padrón actualizado');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await padronService.remove(req.params.id);
    return success(res, null, 'Padrón eliminado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, createValidation, create, update, remove };
