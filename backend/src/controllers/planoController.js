const { body, query } = require('express-validator');
const { validate } = require('../middlewares/validate');
const planoService = require('../services/planoService');
const { TIPOS, ESTADOS } = require('../models/Plano');
const { success, created, badRequest } = require('../utils/apiResponse');

const getByExpediente = async (req, res, next) => {
  try {
    const planos = await planoService.getByExpediente(req.params.expedienteId);
    return success(res, planos);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const plano = await planoService.getById(req.params.id);
    return success(res, plano);
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const { estado, pendiente, search, searchBy, page = 1, limit = 20 } = req.query;
    const filters = {
      estado,
      pendiente: pendiente === 'true' ? true : pendiente === 'false' ? false : undefined,
      search,
      searchBy,
      page: +page,
      limit: +limit,
    };
    const result = await planoService.getDashboard(filters, req.user);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createValidation = [
  body('tipo').isIn(TIPOS).withMessage(`Tipo inválido. Valores: ${TIPOS.join(', ')}`),
  body('expedienteId').isMongoId().withMessage('expedienteId inválido'),
  validate,
];

const create = async (req, res, next) => {
  try {
    const plano = await planoService.create(req.body, req.user);
    return created(res, plano, 'Plano creado');
  } catch (err) {
    next(err);
  }
};

const updateValidation = [
  body('estado_actual').optional().isIn(ESTADOS),
  body('pendiente').optional().isBoolean(),
  validate,
];

const update = async (req, res, next) => {
  try {
    const plano = await planoService.update(req.params.id, req.body, req.user);
    return success(res, plano, 'Plano actualizado');
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const plano = await planoService.assign(req.params.id, req.body);
    return success(res, plano, 'Asignaciones actualizadas');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await planoService.remove(req.params.id);
    return success(res, null, 'Plano eliminado');
  } catch (err) {
    next(err);
  }
};

const buscarExpediente = async (req, res, next) => {
  try {
    const { numero } = req.query;
    if (!numero) return badRequest(res, 'Número de expediente requerido');
    const result = await planoService.buscarExpediente(numero);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const cargaInicialValidation = [
  body('numeroExpediente')
    .notEmpty()
    .matches(/^\d{4}-[A-Z]\d?-\d+$/)
    .withMessage('Formato inválido. Ej: 2024-E-12345, 2024-E1-12345, 2024-E2-12345'),
  body('tipo').isIn(TIPOS).withMessage(`Tipo inválido. Valores: ${TIPOS.join(', ')}`),
  body('padronNumero').notEmpty().withMessage('Número de padrón requerido'),
  validate,
];

const cargaInicial = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) return badRequest(res, 'Se requiere al menos un archivo PDF');
    const { numeroExpediente, tipo, descripcion, padronNumero } = req.body;
    const result = await planoService.cargaInicial(
      { numeroExpediente, tipo, descripcion, padronNumero },
      files,
      req.user.id
    );
    return created(res, result, 'Plano cargado exitosamente');
  } catch (err) {
    next(err);
  }
};

module.exports = { getByExpediente, getById, getDashboard, createValidation, create, updateValidation, update, assign, remove, buscarExpediente, cargaInicialValidation, cargaInicial };
