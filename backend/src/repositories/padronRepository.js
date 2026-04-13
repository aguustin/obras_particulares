const Padron = require('../models/Padron');

const findById = (id) => Padron.findById(id);
const findByNumero = (numero) => Padron.findOne({ numero });
const findAll = (filter = {}, options = {}) => {
  const { page = 1, limit = 20, search } = options;
  const query = { activo: true, ...filter };
  if (search) {
    query.$or = [
      { numero: { $regex: search, $options: 'i' } },
      { direccion: { $regex: search, $options: 'i' } },
      { propietario: { $regex: search, $options: 'i' } },
    ];
  }
  return Padron.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ numero: 1 });
};
const count = (filter = {}, search) => {
  const query = { activo: true, ...filter };
  if (search) {
    query.$or = [
      { numero: { $regex: search, $options: 'i' } },
      { direccion: { $regex: search, $options: 'i' } },
    ];
  }
  return Padron.countDocuments(query);
};
const create = (data) => Padron.create(data);
const update = (id, data) => Padron.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const remove = (id) => Padron.findByIdAndUpdate(id, { activo: false }, { new: true });

module.exports = { findById, findByNumero, findAll, count, create, update, remove };
