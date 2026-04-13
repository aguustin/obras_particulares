const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const expedienteService = require('../services/expedienteService');
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
    .matches(/^\d{4}-[A-Z]-\d+$/)
    .withMessage('Formato inválido. Ej: 2024-E-12345'),
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

module.exports = { getAll, getByPadron, getById, createValidation, create, update, remove };
