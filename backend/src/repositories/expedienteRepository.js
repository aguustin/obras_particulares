const Expediente = require('../models/Expediente');

const findById = (id) => Expediente.findById(id).populate('padronId');
const findByNumero = (numero) => Expediente.findOne({ numero }).populate('padronId');
const findByPadron = (padronId) => Expediente.find({ padronId, activo: true }).sort({ createdAt: -1 });
const findAll = (filter = {}, options = {}) => {
  const { page = 1, limit = 20, search } = options;
  const query = { activo: true, ...filter };
  if (search) {
    query.$or = [{ numero: { $regex: search, $options: 'i' } }];
  }
  return Expediente.find(query)
    .populate('padronId')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};
const count = (filter = {}) => Expediente.countDocuments({ activo: true, ...filter });
const create = (data) => Expediente.create(data);
const update = (id, data) => Expediente.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const remove = (id) => Expediente.findByIdAndUpdate(id, { activo: false }, { new: true });

module.exports = { findById, findByNumero, findByPadron, findAll, count, create, update, remove };
