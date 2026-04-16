const padronRepo = require('../repositories/padronRepository');
const expedienteRepo = require('../repositories/expedienteRepository');
const planoRepo = require('../repositories/planoRepository');
const versionRepo = require('../repositories/versionPlanoRepository');

const getAll = async (options) => {
  const [data, total] = await Promise.all([
    padronRepo.findAll({}, options),
    padronRepo.count({}, options.search),
  ]);
  const { page = 1, limit = 20 } = options;
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const padron = await padronRepo.findById(id);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };
  return padron;
};

const create = async (data) => {
  const existing = await padronRepo.findByNumero(data.numero);
  if (existing) throw { status: 409, message: 'Ya existe un padrón con ese número' };
  return padronRepo.create(data);
};

const update = async (id, data) => {
  const padron = await padronRepo.update(id, data);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };
  return padron;
};

const remove = async (id) => {
  const padron = await padronRepo.findById(id);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };
  // Cascade: eliminar expedientes, planos y versiones del padrón
  const expedientes = await expedienteRepo.findByPadron(id);
  await Promise.all(expedientes.map(async (exp) => {
    const planos = await planoRepo.findByExpediente(exp._id);
    await Promise.all(planos.map((plano) => versionRepo.removeByPlano(plano._id)));
    await planoRepo.removeByExpediente(exp._id);
    await expedienteRepo.remove(exp._id);
  }));
  return padronRepo.remove(id);
};

module.exports = { getAll, getById, create, update, remove };
