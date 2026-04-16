const mongoose = require('mongoose');
const Plano = require('../models/Plano');

const findById = (id) =>
  Plano.findById(id)
    .populate('expedienteId')
    .populate('profesionales_asignados', 'nombre email rol')
    .populate('tecnicos_asignados', 'nombre email rol');

const findByExpediente = (expedienteId) =>
  Plano.find({ expedienteId })
    .populate('profesionales_asignados', 'nombre email rol')
    .populate('tecnicos_asignados', 'nombre email rol');

const findByExpedienteAndTipo = (expedienteId, tipo) => Plano.findOne({ expedienteId, tipo });

const countByExpediente = (expedienteId) => Plano.countDocuments({ expedienteId });

const create = (data) => Plano.create(data);

const update = (id, data) =>
  Plano.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('profesionales_asignados', 'nombre email rol')
    .populate('tecnicos_asignados', 'nombre email rol');

const remove = (id) => Plano.findByIdAndDelete(id);

// Aggregation for dashboard lists
const aggregateByEstado = async ({ estado, pendiente, tecnicoId, page = 1, limit = 20 }) => {
  const matchStage = {};

  if (estado === 'OBSERVADO') {
    matchStage.estado_actual = { $in: ['OBSERVADO', 'PRE_APROBADO'] };
  } else {
    matchStage.estado_actual = estado;
  }

  if (pendiente !== undefined) {
    matchStage.pendiente = pendiente;
  }

  if (tecnicoId) {
    matchStage.tecnicos_asignados = new mongoose.Types.ObjectId(tecnicoId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'expedientes',
        localField: 'expedienteId',
        foreignField: '_id',
        as: 'expediente',
      },
    },
    { $unwind: '$expediente' },
    {
      $lookup: {
        from: 'padrones',
        localField: 'expediente.padronId',
        foreignField: '_id',
        as: 'padron',
      },
    },
    { $unwind: '$padron' },
    {
      $lookup: {
        from: 'users',
        localField: 'profesionales_asignados',
        foreignField: '_id',
        as: 'profesionales',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'tecnicos_asignados',
        foreignField: '_id',
        as: 'tecnicos',
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await Plano.aggregate(pipeline);
  return {
    data: result.data,
    total: result.total[0]?.count || 0,
    page,
    limit,
    pages: Math.ceil((result.total[0]?.count || 0) / limit),
  };
};

// Aggregate padrones with their expedientes and planos, filtered
const aggregateDashboard = async ({ estado, pendiente, search, searchBy, tiposPermitidos, profesionalId, page = 1, limit = 20 }) => {
  const planoMatch = {};

  if (estado === 'OBSERVADOS') {
    planoMatch.estado_actual = { $in: ['OBSERVADO', 'PRE_APROBADO'] };
  } else if (estado === 'PRE_APROBADO') {
    planoMatch.estado_actual = 'PRE_APROBADO';
  } else if (estado) {
    planoMatch.estado_actual = estado;
  }

  if (pendiente !== undefined) {
    planoMatch.pendiente = pendiente;
  }

  if (tiposPermitidos && tiposPermitidos.length > 0) {
    planoMatch.tipo = { $in: tiposPermitidos };
  }

  if (profesionalId) {
    planoMatch.profesionales_asignados = new mongoose.Types.ObjectId(profesionalId);
  }

  const padronMatch = { activo: true };
  const expedienteMatch = { activo: true };

  if (search && searchBy === 'padron') {
    padronMatch.$or = [
      { numero: { $regex: search, $options: 'i' } },
      { direccion: { $regex: search, $options: 'i' } },
    ];
  }
  if (search && searchBy === 'expediente') {
    expedienteMatch.numero = { $regex: search, $options: 'i' };
  }

  const pipeline = [
    { $match: padronMatch },
    {
      $lookup: {
        from: 'expedientes',
        let: { padronId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$padronId', '$$padronId'] }, { $eq: ['$activo', true] }] } } },
          ...(search && searchBy === 'expediente' ? [{ $match: expedienteMatch }] : []),
          {
            $lookup: {
              from: 'planos',
              let: { expedienteId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$expedienteId', '$$expedienteId'] } } },
                ...(Object.keys(planoMatch).length ? [{ $match: planoMatch }] : []),
                {
                  $lookup: {
                    from: 'users',
                    localField: 'profesionales_asignados',
                    foreignField: '_id',
                    as: 'profesionales',
                  },
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'tecnicos_asignados',
                    foreignField: '_id',
                    as: 'tecnicos',
                  },
                },
              ],
              as: 'planos',
            },
          },
          { $match: { 'planos.0': { $exists: true } } },
        ],
        as: 'expedientes',
      },
    },
    { $match: { 'expedientes.0': { $exists: true } } },
    { $sort: { numero: 1 } },
    {
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const Padron = require('../models/Padron');
  const [result] = await Padron.aggregate(pipeline);
  return {
    data: result?.data || [],
    total: result?.total[0]?.count || 0,
    page,
    limit,
    pages: Math.ceil((result?.total[0]?.count || 0) / limit),
  };
};

const removeByExpediente = (expedienteId) => Plano.deleteMany({ expedienteId });

module.exports = {
  findById,
  findByExpediente,
  findByExpedienteAndTipo,
  countByExpediente,
  create,
  update,
  remove,
  removeByExpediente,
  aggregateByEstado,
  aggregateDashboard,
};
