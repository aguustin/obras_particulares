const User = require('../models/User');
const Padron = require('../models/Padron');
const Expediente = require('../models/Expediente');
const Plano = require('../models/Plano');
const VersionPlano = require('../models/VersionPlano');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { success } = require('../utils/apiResponse');

const backup = async (req, res, next) => {
  try {
    const [users, padrones, expedientes, planos, versiones] = await Promise.all([
      User.find({}).lean(),
      Padron.find({}).lean(),
      Expediente.find({}).lean(),
      Plano.find({}).lean(),
      VersionPlano.find({}).lean(),
    ]);

    const payload = {
      _meta: {
        generadoEn: new Date().toISOString(),
        generadoPor: req.user.id,
        version: '1.0',
        totales: {
          usuarios: users.length,
          padrones: padrones.length,
          expedientes: expedientes.length,
          planos: planos.length,
          versiones: versiones.length,
        },
      },
      users,
      padrones,
      expedientes,
      planos,
      versiones,
    };

    const fecha = new Date().toISOString().slice(0, 10);
    logger.info(`Backup descargado por usuario ${req.user.id}`);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="obras-backup-${fecha}.json"`);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ─── Gestión de técnicos ─────────────────────────────────────────────────────

const getTecnicos = async (req, res, next) => {
  try {
    const tecnicos = await User.find({ rol: 'TECNICO' })
      .select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires')
      .sort({ createdAt: -1 });
    return success(res, tecnicos);
  } catch (err) {
    next(err);
  }
};

const approveTecnico = async (req, res, next) => {
  try {
    const tecnico = await User.findOneAndUpdate(
      { _id: req.params.id, rol: 'TECNICO' },
      { activo: true, emailVerified: true, pendienteAprobacion: false },
      { new: true }
    ).select('-password');

    if (!tecnico) throw { status: 404, message: 'Técnico no encontrado' };

    await emailService.sendTecnicoAprobado(tecnico.email, tecnico.nombre);
    logger.info(`Técnico aprobado: ${tecnico.email}`);
    return success(res, tecnico, 'Técnico aprobado y notificado por email');
  } catch (err) {
    next(err);
  }
};

const rejectTecnico = async (req, res, next) => {
  try {
    const tecnico = await User.findOneAndDelete({ _id: req.params.id, rol: 'TECNICO', pendienteAprobacion: true });
    if (!tecnico) throw { status: 404, message: 'Técnico pendiente no encontrado' };

    await emailService.sendTecnicoRechazado(tecnico.email, tecnico.nombre);
    logger.info(`Técnico rechazado: ${tecnico.email}`);
    return success(res, null, 'Solicitud rechazada y técnico notificado');
  } catch (err) {
    next(err);
  }
};

const toggleActivo = async (req, res, next) => {
  try {
    const tecnico = await User.findOne({ _id: req.params.id, rol: 'TECNICO' });
    if (!tecnico) throw { status: 404, message: 'Técnico no encontrado' };

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { activo: !tecnico.activo },
      { new: true }
    ).select('-password');

    const accion = updated.activo ? 'reactivado' : 'dado de baja';
    logger.info(`Técnico ${accion}: ${updated.email}`);
    return success(res, updated, `Técnico ${accion} correctamente`);
  } catch (err) {
    next(err);
  }
};

const updatePermisos = async (req, res, next) => {
  try {
    const { permisos_planos } = req.body;
    const tecnico = await User.findOneAndUpdate(
      { _id: req.params.id, rol: 'TECNICO' },
      { permisos_planos: permisos_planos || [] },
      { new: true, runValidators: true }
    ).select('-password');

    if (!tecnico) throw { status: 404, message: 'Técnico no encontrado' };
    return success(res, tecnico, 'Permisos actualizados');
  } catch (err) {
    next(err);
  }
};

module.exports = { backup, getTecnicos, approveTecnico, rejectTecnico, toggleActivo, updatePermisos };
