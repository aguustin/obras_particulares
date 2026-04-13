const planoRepo = require('../repositories/planoRepository');
const expedienteRepo = require('../repositories/expedienteRepository');

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

  return planoRepo.create({ ...data });
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
  return planoRepo.remove(id);
};

const getDashboard = async (filters, user) => {
  const options = { ...filters };

  // TECNICO only sees assigned planos
  if (user.rol === 'TECNICO') {
    options.tecnicoId = user.id;
  }

  return planoRepo.aggregateDashboard(options);
};

const assign = async (id, { profesionales, tecnicos }) => {
  const plano = await planoRepo.findById(id);
  if (!plano) throw { status: 404, message: 'Plano no encontrado' };
  return planoRepo.update(id, {
    ...(profesionales !== undefined && { profesionales_asignados: profesionales }),
    ...(tecnicos !== undefined && { tecnicos_asignados: tecnicos }),
  });
};

module.exports = { getByExpediente, getById, create, update, remove, getDashboard, assign };
