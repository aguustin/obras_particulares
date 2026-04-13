const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const versionService = require('../services/versionPlanoService');
const { success, created, badRequest } = require('../utils/apiResponse');

const getByPlano = async (req, res, next) => {
  try {
    const versions = await versionService.getByPlano(req.params.planoId);
    return success(res, versions);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const version = await versionService.getById(req.params.id);
    return success(res, version);
  } catch (err) {
    next(err);
  }
};

const upload = async (req, res, next) => {
  try {
    if (!req.file) return badRequest(res, 'Archivo PDF requerido');
    const version = await versionService.create(
      req.params.planoId,
      { descripcion: req.body.descripcion },
      req.file.buffer,
      req.file.originalname,
      req.user.id
    );
    return created(res, version, 'Versión subida');
  } catch (err) {
    next(err);
  }
};

const addObservacion = async (req, res, next) => {
  try {
    const archivos = req.files || [];
    const version = await versionService.addObservacion(
      req.params.id,
      { descripcion: req.body.descripcion },
      archivos,
      req.user.id
    );
    return success(res, version, 'Observación agregada');
  } catch (err) {
    next(err);
  }
};

const addComentario = async (req, res, next) => {
  try {
    const version = await versionService.addComentario(
      req.params.id,
      req.body.mensaje,
      req.user.id
    );
    return success(res, version, 'Comentario agregado');
  } catch (err) {
    next(err);
  }
};

const getDownloadUrl = async (req, res, next) => {
  try {
    const url = await versionService.getSignedUrl(req.params.id);
    return success(res, { url });
  } catch (err) {
    next(err);
  }
};

const comentarioValidation = [
  body('mensaje').notEmpty().withMessage('Mensaje requerido'),
  validate,
];

const observacionValidation = [
  body('descripcion').notEmpty().withMessage('Descripción requerida'),
  validate,
];

module.exports = {
  getByPlano,
  getById,
  upload,
  addObservacion,
  addComentario,
  getDownloadUrl,
  comentarioValidation,
  observacionValidation,
};
