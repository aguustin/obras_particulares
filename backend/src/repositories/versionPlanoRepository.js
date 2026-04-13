const VersionPlano = require('../models/VersionPlano');

const findById = (id) =>
  VersionPlano.findById(id)
    .populate('subido_por', 'nombre email rol')
    .populate('observacion_tecnica.tecnico', 'nombre email')
    .populate('comentarios.usuario', 'nombre email rol');

const findByPlano = (planoId) =>
  VersionPlano.find({ planoId })
    .populate('subido_por', 'nombre email rol')
    .populate('observacion_tecnica.tecnico', 'nombre email')
    .populate('comentarios.usuario', 'nombre email rol')
    .sort({ numero_version: -1 });

const getLatestByPlano = (planoId) =>
  VersionPlano.findOne({ planoId })
    .populate('subido_por', 'nombre email rol')
    .sort({ numero_version: -1 });

const getNextVersion = async (planoId) => {
  const latest = await VersionPlano.findOne({ planoId }).sort({ numero_version: -1 });
  return latest ? latest.numero_version + 1 : 1;
};

const create = (data) => VersionPlano.create(data);

const update = (id, data) =>
  VersionPlano.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const addComentario = (id, comentario) =>
  VersionPlano.findByIdAndUpdate(
    id,
    { $push: { comentarios: comentario } },
    { new: true }
  ).populate('comentarios.usuario', 'nombre email rol');

const setObservacion = (id, observacion) =>
  VersionPlano.findByIdAndUpdate(
    id,
    { $set: { observacion_tecnica: observacion } },
    { new: true }
  );

module.exports = {
  findById,
  findByPlano,
  getLatestByPlano,
  getNextVersion,
  create,
  update,
  addComentario,
  setObservacion,
};
