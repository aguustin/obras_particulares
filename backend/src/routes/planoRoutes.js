const router = require('express').Router();
const ctrl = require('../controllers/planoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/dashboard', ctrl.getDashboard);
router.get('/expediente/:expedienteId', ctrl.getByExpediente);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN', 'TECNICO', 'PROFESIONAL'), ctrl.createValidation, ctrl.create);
router.put('/:id', ctrl.updateValidation, ctrl.update);
router.patch('/:id/assign', authorize('ADMIN'), ctrl.assign);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

module.exports = router;
