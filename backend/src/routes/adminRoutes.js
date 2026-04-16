const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const ctrl = require('../controllers/adminController');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/backup', ctrl.backup);

// Gestión de técnicos
router.get('/tecnicos', ctrl.getTecnicos);
router.post('/tecnicos/:id/approve', ctrl.approveTecnico);
router.delete('/tecnicos/:id/reject', ctrl.rejectTecnico);
router.patch('/tecnicos/:id/toggle', ctrl.toggleActivo);
router.patch('/tecnicos/:id/permisos', ctrl.updatePermisos);

module.exports = router;
