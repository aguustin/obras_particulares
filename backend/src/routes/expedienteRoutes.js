const router = require('express').Router();
const ctrl = require('../controllers/expedienteController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/padron/:padronId', ctrl.getByPadron);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN', 'TECNICO'), ctrl.createValidation, ctrl.create);
router.put('/:id', authorize('ADMIN', 'TECNICO'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

// Gestión de accesos (solo ADMIN)
router.post('/:id/authorize', authorize('ADMIN'), ctrl.authorizeValidation, ctrl.authorizeUser);
router.delete('/:id/authorize/:userId', authorize('ADMIN'), ctrl.deauthorizeUser);

module.exports = router;
