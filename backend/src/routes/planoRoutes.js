const router = require('express').Router();
const ctrl = require('../controllers/planoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { upload, handleMulterError } = require('../middlewares/upload');

router.use(authenticate);

router.get('/dashboard', ctrl.getDashboard);
router.get('/buscar', ctrl.buscarExpediente);
router.get('/expediente/:expedienteId', ctrl.getByExpediente);
router.get('/:id', ctrl.getById);

// Carga inicial profesional: crea padrón + expediente + plano + versión en un paso
router.post(
  '/carga-inicial',
  authorize('PROFESIONAL', 'ADMIN'),
  upload.array('pdf', 10),
  handleMulterError,
  ctrl.cargaInicialValidation,
  ctrl.cargaInicial
);

router.post('/', authorize('ADMIN', 'TECNICO', 'PROFESIONAL'), ctrl.createValidation, ctrl.create);
router.put('/:id', ctrl.updateValidation, ctrl.update);
router.patch('/:id/assign', authorize('ADMIN'), ctrl.assign);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

module.exports = router;
