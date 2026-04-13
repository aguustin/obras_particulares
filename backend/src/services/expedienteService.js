const expedienteRepo = require('../repositories/expedienteRepository');
const padronRepo = require('../repositories/padronRepository');

const getAll = async (options) => {
  const [data, total] = await Promise.all([
    expedienteRepo.findAll({}, options),
    expedienteRepo.count({}),
  ]);
  const { page = 1, limit = 20 } = options;
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};

const getByPadron = async (padronId) => {
  const padron = await padronRepo.findById(padronId);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };
  return expedienteRepo.findByPadron(padronId);
};

const getById = async (id) => {
  const exp = await expedienteRepo.findById(id);
  if (!exp) throw { status: 404, message: 'Expediente no encontrado' };
  return exp;
};

const create = async (data) => {
  const padron = await padronRepo.findById(data.padronId);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };

  const existing = await expedienteRepo.findByNumero(data.numero);
  if (existing) throw { status: 409, message: 'Ya existe un expediente con ese número' };

  return expedienteRepo.create(data);
};

const update = async (id, data) => {
  const exp = await expedienteRepo.update(id, data);
  if (!exp) throw { status: 404, message: 'Expediente no encontrado' };
  return exp;
};

const remove = async (id) => {
  const exp = await expedienteRepo.remove(id);
  if (!exp) throw { status: 404, message: 'Expediente no encontrado' };
  return exp;
};

module.exports = { getAll, getByPadron, getById, create, update, remove };
