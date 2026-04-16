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
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) return badRequest(res, 'Se requiere al menos un archivo PDF');
    const version = await versionService.create(
      req.params.planoId,
      { descripcion: req.body.descripcion },
      files,
      req.user
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
      req.user
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
      req.user
    );
    return success(res, version, 'Comentario agregado');
  } catch (err) {
    next(err);
  }
};

const getDownloadUrl = async (req, res, next) => {
  try {
    const fileIndex = parseInt(req.query.index ?? 0, 10);
    const url = await versionService.getSignedUrl(req.params.id, fileIndex);
    return success(res, { url });
  } catch (err) {
    next(err);
  }
};

const updateArchivos = async (req, res, next) => {
  try {
    const newFiles = req.files || [];
    const keepKeys = req.body.keepKeys
      ? (Array.isArray(req.body.keepKeys) ? req.body.keepKeys : [req.body.keepKeys])
      : [];
    const version = await versionService.updateArchivos(req.params.id, keepKeys, newFiles, req.user);
    return success(res, version, 'Archivos actualizados');
  } catch (err) {
    next(err);
  }
};

const updateDescripcion = async (req, res, next) => {
  try {
    const version = await versionService.updateDescripcion(
      req.params.id,
      req.body.descripcion,
      req.user
    );
    return success(res, version, 'Descripción actualizada');
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
  updateDescripcion,
  updateArchivos,
  comentarioValidation,
  observacionValidation,
};
