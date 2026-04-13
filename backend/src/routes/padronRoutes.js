const router = require('express').Router();
const ctrl = require('../controllers/padronController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('ADMIN'), ctrl.createValidation, ctrl.create);
router.put('/:id', authorize('ADMIN'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

module.exports = router;
