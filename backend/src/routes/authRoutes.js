const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

// Rutas públicas
router.post('/login', ctrl.loginValidation, ctrl.login);
router.post('/register-self', ctrl.registerSelfValidation, ctrl.registerSelf);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPasswordValidation, ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPasswordValidation, ctrl.resetPassword);

// Rutas protegidas
router.get('/me', authenticate, ctrl.me);
router.post('/register', authenticate, authorize('ADMIN'), ctrl.registerValidation, ctrl.register);
router.get('/users', authenticate, authorize('ADMIN'), ctrl.getUsers);

module.exports = router;
