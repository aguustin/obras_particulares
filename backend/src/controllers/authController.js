const crypto = require('crypto');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const userRepo = require('../repositories/userRepository');
const User = require('../models/User');
const { success, created, badRequest } = require('../utils/apiResponse');

// ─── Validaciones ─────────────────────────────────────────────────────────────

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password requerido'),
  validate,
];

const registerValidation = [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('rol').isIn(['ADMIN', 'TECNICO', 'PROFESIONAL']).withMessage('Rol inválido'),
  validate,
];

const registerSelfValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre').if(body('esTecnico').equals('true')).notEmpty().withMessage('Nombre requerido'),
  body('apellido').if(body('esTecnico').equals('true')).notEmpty().withMessage('Apellido requerido'),
  body('dni').if(body('esTecnico').equals('true')).notEmpty().withMessage('DNI requerido'),
  validate,
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  validate,
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requerido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate,
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password);
    return success(res, { token, user }, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

// Registro por un admin (flujo existente, sin verificación de email)
const register = async (req, res, next) => {
  try {
    const user = await userRepo.create({ ...req.body, emailVerified: true, activo: true });
    return created(res, user, 'Usuario creado');
  } catch (err) {
    next(err);
  }
};

// Autoregistro público — profesional (verif. email) o técnico (aprobación admin)
const registerSelf = async (req, res, next) => {
  try {
    const { email, password, esTecnico, nombre, apellido, dni } = req.body;

    const existing = await userRepo.findByEmail(email);
    if (existing) {
      return badRequest(res, 'Ya existe una cuenta con ese email');
    }

    if (esTecnico) {
      // Flujo técnico: sin verificación de email, queda pendiente hasta que admin apruebe
      const tecnico = await User.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        email,
        password,
        rol: 'TECNICO',
        activo: false,
        emailVerified: false,
        pendienteAprobacion: true,
      });

      await emailService.sendTecnicoRegistroAdmin(tecnico);

      return created(res, null, 'Solicitud enviada. Un administrador revisará tu registro y recibirás un email con la respuesta.');
    }

    // Flujo profesional: verificación por email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

    await User.create({
      nombre: email.split('@')[0],
      email,
      password,
      rol: 'PROFESIONAL',
      activo: false,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await emailService.sendVerificationEmail(email, verificationToken);

    return created(res, null, 'Registro exitoso. Revisá tu email para verificar tu cuenta.');
  } catch (err) {
    next(err);
  }
};

// Verificar cuenta con token
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return badRequest(res, 'Token requerido');

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return badRequest(res, 'El enlace de verificación es inválido o ya expiró');
    }

    user.emailVerified = true;
    user.activo = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return success(res, null, 'Cuenta verificada correctamente. Ya podés iniciar sesión.');
  } catch (err) {
    next(err);
  }
};

// Solicitar recuperación de contraseña
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userRepo.findByEmail(email);

    // Responder siempre igual por seguridad (no revelar si el email existe)
    const MSG = 'Si el email existe, recibirás un enlace para recuperar tu contraseña.';

    if (!user || !user.activo) {
      return success(res, null, MSG);
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 h

    await User.findByIdAndUpdate(user._id, { resetPasswordToken, resetPasswordTokenExpires });

    await emailService.sendResetPasswordEmail(email, resetPasswordToken);

    return success(res, null, MSG);
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña con token
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return badRequest(res, 'El enlace para recuperar contraseña es inválido o ya expiró');
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;
    await user.save();

    return success(res, null, 'Contraseña actualizada correctamente. Ya podés iniciar sesión.');
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userRepo.findAll();
    return success(res, users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login, loginValidation,
  me,
  register, registerValidation,
  registerSelf, registerSelfValidation,
  verifyEmail,
  forgotPassword, forgotPasswordValidation,
  resetPassword, resetPasswordValidation,
  getUsers,
};
