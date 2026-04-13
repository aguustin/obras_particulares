const User = require('../models/User');

const findById = (id) => User.findById(id);
const findByEmail = (email) => User.findOne({ email });
const findAll = (filter = {}) => User.find({ activo: true, ...filter }).select('-password');
const create = (data) => User.create(data);
const update = (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const remove = (id) => User.findByIdAndUpdate(id, { activo: false }, { new: true });

module.exports = { findById, findByEmail, findAll, create, update, remove };
