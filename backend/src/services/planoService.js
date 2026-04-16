const planoRepo = require('../repositories/planoRepository');
const expedienteRepo = require('../repositories/expedienteRepository');
const padronRepo = require('../repositories/padronRepository');
const versionRepo = require('../repositories/versionPlanoRepository');
const storageService = require('./storageService');

const MAX_PLANOS = 6;

const getByExpediente = async (expedienteId) => {
  const exp = await expedienteRepo.findById(expedienteId);
  if (!exp) throw { status: 404, message: 'Expediente no encontrado' };
  return planoRepo.findByExpediente(expedienteId);
};

const getById = async (id) => {
  const plano = await planoRepo.findById(id);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };
  return plano;
};

const create = async (data, user) => {
  const exp = await expedienteRepo.findById(data.expedienteId);
  if (!exp) throw { status: 404, message: 'Expediente no encontrado' };

  const count = await planoRepo.countByExpediente(data.expedienteId);
  if (count >= MAX_PLANOS) throw { status: 400, message: `Máximo ${MAX_PLANOS} planos por expediente` };

  const existing = await planoRepo.findByExpedienteAndTipo(data.expedienteId, data.tipo);
  if (existing) throw { status: 409, message: `Ya existe un plano de tipo ${data.tipo} en este expediente` };

  const profesionales = user.rol === 'PROFESIONAL' ? [user.id] : (data.profesionales_asignados || []);
  return planoRepo.create({ ...data, profesionales_asignados: profesionales });
};

const update = async (id, data, user) => {
  const plano = await planoRepo.findById(id);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };

  // Only ADMIN/TECNICO can change estado
  if (data.estado_actual && user.rol === 'PROFESIONAL') {
    throw { status: 403, message: 'Sin permisos para cambiar estado' };
  }

  return planoRepo.update(id, data);
};

const remove = async (id) => {
  const plano = await planoRepo.findById(id);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };
  await versionRepo.removeByPlano(id);
  return planoRepo.remove(id);
};

const getDashboard = async (filters, user) => {
  const options = { ...filters };

  if (user.rol === 'TECNICO') {
    const User = require('../models/User');
    const tecnico = await User.findById(user.id).select('permisos_planos').lean();
    const tiposPermitidos = tecnico?.permisos_planos || [];
    if (tiposPermitidos.length === 0) return { data: [], total: 0, page: options.page || 1, limit: options.limit || 20, pages: 0 };
    options.tiposPermitidos = tiposPermitidos;
  } else if (user.rol === 'PROFESIONAL') {
    options.profesionalId = user.id;
  }

  return planoRepo.aggregateDashboard(options);
};

/**
 * Busca un expediente por número. Si no existe, simula un número de padrón.
 * En producción este padrón vendría de un servicio externo municipal.
 */
const buscarExpediente = async (numero) => {
  const expediente = await expedienteRepo.findByNumero(numero);
  if (expediente) {
    return {
      existe: true,
      expediente,
      padron: expediente.padronId,
    };
  }
  // Simular padrón con número aleatorio (5 dígitos)
  const padronSimulado = String(Math.floor(10000 + Math.random() * 90000));
  return {
    existe: false,
    expediente: null,
    padronSimulado,
  };
};

/**
 * Carga inicial de un profesional: crea padrón (si no existe), expediente (si no existe),
 * plano y primera versión con PDF, todo en un solo flujo.
 */
const cargaInicial = async ({ numeroExpediente, tipo, descripcion, padronNumero }, files, userId) => {
  // files: array of { buffer, originalname }
  // Buscar o crear padrón
  let padron = await padronRepo.findByNumero(padronNumero);
  if (!padron) {
    padron = await padronRepo.create({ numero: padronNumero });
  }

  // Buscar o crear expediente
  let expediente = await expedienteRepo.findByNumero(numeroExpediente);
  if (!expediente) {
    expediente = await expedienteRepo.create({ numero: numeroExpediente, padronId: padron._id });
  }

  // Auto-autorizar al profesional en el expediente (idempotente: $addToSet no duplica)
  await expedienteRepo.authorizeUser(expediente._id, userId);

  // Verificar límite y duplicado ANTES de subir nada
  const count = await planoRepo.countByExpediente(expediente._id);
  if (count >= MAX_PLANOS) {
    throw { status: 400, message: `El expediente ya tiene el máximo de ${MAX_PLANOS} planos` };
  }
  const existing = await planoRepo.findByExpedienteAndTipo(expediente._id, tipo);
  if (existing) {
    const yaAsignado = existing.profesionales_asignados.some(
      (p) => p.toString() === userId.toString()
    );
    throw {
      status: 409,
      message: yaAsignado
        ? `Ya cargaste un plano de tipo ${tipo} para este expediente`
        : `Ya existe un plano de tipo ${tipo} en este expediente`,
    };
  }

  // Subir todos los PDFs PRIMERO — si falla, no se crea ningún registro en la DB
  const archivos = await Promise.all(
    files.map(async (f) => {
      const { key, url } = await storageService.uploadPdf(f.buffer, f.originalname, 'planos/tmp');
      return { url, key, nombre: f.originalname };
    })
  );

  // Recién ahora crear plano y versión
  const plano = await planoRepo.create({
    expedienteId: expediente._id,
    tipo,
    estado_actual: 'PRESENTADO',
    pendiente: true,
    profesionales_asignados: [userId],
  });

  const version = await versionRepo.create({
    planoId: plano._id,
    numero_version: 1,
    archivos,
    archivo_pdf_url: archivos[0].url,
    archivo_pdf_key: archivos[0].key,
    descripcion: descripcion || '',
    subido_por: userId,
  });

  const [planoPopulado, versionPopulada] = await Promise.all([
    planoRepo.findById(plano._id),
    versionRepo.findById(version._id),
  ]);

  return {
    padron: padron.toObject(),
    expediente: expediente.toObject ? expediente.toObject() : expediente,
    plano: planoPopulado,
    version: versionPopulada,
  };
};

const assign = async (id, { profesionales, tecnicos }) => {
  const plano = await planoRepo.findById(id);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };
  return planoRepo.update(id, {
    ...(profesionales !== undefined && { profesionales_asignados: profesionales }),
    ...(tecnicos !== undefined && { tecnicos_asignados: tecnicos }),
  });
};

module.exports = { getByExpediente, getById, create, update, remove, getDashboard, assign, buscarExpediente, cargaInicial };
