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

const checkTecnicoAcceso = (plano, user) => {
  if (!user || user.rol !== 'TECNICO') return;
  const autorizados = plano.expedienteId?.usuarios_autorizados || [];
  const userId = (user.id || user._id || '').toString();
  const autorizado = autorizados.some((id) => id.toString() === userId);
  if (!autorizado) throw { status: 403, message: 'No tenés acceso para interactuar con este plano' };
};

const create = async (planoId, { descripcion }, files, user) => {
  // files: array of { buffer, originalname }
  const userId = user.id || user._id;
  const plano = await planoRepo.findById(planoId);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };

  checkTecnicoAcceso(plano, user);

  if (!files || files.length === 0) throw { status: 400, message: 'Se requiere al menos un archivo PDF' };

  const archivos = await Promise.all(
    files.map(async (f) => {
      const { key, url } = await storageService.uploadPdf(f.buffer, f.originalname, `planos/${planoId}`);
      return { url, key, nombre: f.originalname };
    })
  );

  const numero_version = await versionRepo.getNextVersion(planoId);

  const version = await versionRepo.create({
    planoId,
    numero_version,
    archivos,
    // compat: primer archivo en campos legacy
    archivo_pdf_url: archivos[0].url,
    archivo_pdf_key: archivos[0].key,
    descripcion,
    subido_por: userId,
  });

  // Mark plano as EN_PROGRESO when new version uploaded
  if (plano.estado_actual === 'PRESENTADO') {
    await planoRepo.update(planoId, { estado_actual: 'EN_PROGRESO', pendiente: true });
  }

  return versionRepo.findById(version._id);
};

const addObservacion = async (versionId, observacionData, archivos, user) => {
  const userId = user.id || user._id;
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  const plano = await planoRepo.findById(version.planoId);
  if (plano) checkTecnicoAcceso(plano, user);

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

const addComentario = async (versionId, mensaje, user) => {
  const userId = user.id || user._id;
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  const plano = await planoRepo.findById(version.planoId);
  if (plano) checkTecnicoAcceso(plano, user);

  const comentario = { usuario: userId, mensaje, fecha: new Date() };
  return versionRepo.addComentario(versionId, comentario);
};

const getSignedUrl = async (versionId, fileIndex = 0) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };
  // Prefer new archivos array, fall back to legacy single-file fields
  if (version.archivos && version.archivos.length > 0) {
    const archivo = version.archivos[fileIndex] || version.archivos[0];
    return storageService.getSignedDownloadUrl(archivo.key);
  }
  return storageService.getSignedDownloadUrl(version.archivo_pdf_key);
};

const updateArchivos = async (versionId, keepKeys, newFiles, user) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  if (version.observacion_tecnica) {
    throw { status: 403, message: 'No se puede editar una versión que ya tiene observación técnica' };
  }

  const plano = await planoRepo.findById(version.planoId);
  if (plano) {
    const estadosEditables = ['PRESENTADO', 'EN_PROGRESO'];
    if (!estadosEditables.includes(plano.estado_actual)) {
      throw { status: 403, message: 'No se puede editar la versión en el estado actual del plano' };
    }
  }

  const currentArchivos = version.archivos && version.archivos.length > 0
    ? version.archivos
    : (version.archivo_pdf_key ? [{ key: version.archivo_pdf_key, url: version.archivo_pdf_url, nombre: 'documento.pdf' }] : []);

  // Delete files that are not in keepKeys
  const keepSet = new Set(keepKeys || []);
  for (const archivo of currentArchivos) {
    if (!keepSet.has(archivo.key)) {
      await storageService.deletePdf(archivo.key);
    }
  }

  const keptArchivos = currentArchivos.filter((a) => keepSet.has(a.key));

  // Upload new files
  const uploadedArchivos = await Promise.all(
    (newFiles || []).map(async (f) => {
      const { key, url } = await storageService.uploadPdf(f.buffer, f.originalname, `planos/${version.planoId}`);
      return { url, key, nombre: f.originalname };
    })
  );

  const archivos = [...keptArchivos, ...uploadedArchivos];
  if (archivos.length === 0) throw { status: 400, message: 'La versión debe tener al menos un archivo PDF' };

  const updateData = {
    archivos,
    archivo_pdf_url: archivos[0].url,
    archivo_pdf_key: archivos[0].key,
  };

  return versionRepo.update(versionId, updateData);
};

const updateDescripcion = async (versionId, descripcion, user) => {
  const version = await versionRepo.findById(versionId);
  if (!version) throw { status: 404, message: 'Versión no encontrada' };

  // Only editable while no observation has been added and plano is in an early state
  if (version.observacion_tecnica) {
    throw { status: 403, message: 'No se puede editar una versión que ya tiene observación técnica' };
  }

  const plano = await planoRepo.findById(version.planoId);
  if (plano) {
    const estadosEditables = ['PRESENTADO', 'EN_PROGRESO'];
    if (!estadosEditables.includes(plano.estado_actual)) {
      throw { status: 403, message: 'No se puede editar la versión en el estado actual del plano' };
    }
  }

  return versionRepo.update(versionId, { descripcion });
};

module.exports = { getByPlano, getById, create, addObservacion, addComentario, getSignedUrl, updateDescripcion, updateArchivos };
