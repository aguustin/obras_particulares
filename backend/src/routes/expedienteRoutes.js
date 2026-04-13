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

module.exports = router;
