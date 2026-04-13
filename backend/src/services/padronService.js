const padronRepo = require('../repositories/padronRepository');

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
  const padron = await padronRepo.remove(id);
  if (!padron) throw { status: 404, message: 'Padrón no encontrado' };
  return padron;
};

module.exports = { getAll, getById, create, update, remove };
