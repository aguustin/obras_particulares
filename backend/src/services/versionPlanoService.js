const versionRepo = require('../repositories/versionPlanoRepository');
const planoRepo = require('../repositories/planoRepository');
const storageService = require('./storageService');

const getByPlano = async (planoId) => {
  const plano = await planoRepo.findById(planoId);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };
  return versionRepo.findByPlano(planoId);
};

const getById = async (id) => {
  const version = await versionRepo.findById(id);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };
  return version;
};

const create = async (planoId, { descripcion }, fileBuffer, fileName, userId) => {
  const plano = await planoRepo.findById(planoId);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };

  const { key, url } = await storageService.uploadPdf(fileBuffer, fileName, `planos/${planoId}`);
  const numero_version = await versionRepo.getNextVersion(planoId);

  const version = await versionRepo.create({
    planoId,
    numero_version,
    archivo_pdf_url: url,
    archivo_pdf_key: key,
    descripcion,
    subido_por: userId,
  });

  // Mark plano as EN_PROGRESO when new version uploaded
  if (plano.estado_actual === 'PRESENTADO') {
    await planoRepo.update(planoId, { estado_actual: 'EN_PROGRESO', pendiente: true });
  }

  return versionRepo.findById(version._id);
};

const addObservacion = async (versionId, observacionData, archivos, userId) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  const archivosUrls = [];
  for (const file of archivos) {
    const { url } = await storageService.uploadPdf(file.buffer, file.originalname, 'observaciones');
    archivosUrls.push(url);
  }

  const observacion = {
    descripcion: observacionData.descripcion,
    archivos_pdf: archivosUrls,
    tecnico: userId,
    fecha: new Date(),
  };

  await versionRepo.setObservacion(versionId, observacion);

  // Update plano estado to OBSERVADO
  await planoRepo.update(version.planoId, { estado_actual: 'OBSERVADO', pendiente: true });

  return versionRepo.findById(versionId);
};

const addComentario = async (versionId, mensaje, userId) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  const comentario = { usuario: userId, mensaje, fecha: new Date() };
  return versionRepo.addComentario(versionId, comentario);
};

const getSignedUrl = async (versionId) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };
  return storageService.getSignedDownloadUrl(version.archivo_pdf_key);
};

module.exports = { getByPlano, getById, create, addObservacion, addComentario, getSignedUrl };
