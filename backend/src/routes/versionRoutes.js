const router = require('express').Router();
const ctrl = require('../controllers/versionPlanoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { upload, handleMulterError } = require('../middlewares/upload');

router.use(authenticate);

router.get('/plano/:planoId', ctrl.getByPlano);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.getDownloadUrl);

// Upload new version (PROFESIONAL, TECNICO, ADMIN)
router.post(
  '/plano/:planoId',
  upload.single('pdf'),
  handleMulterError,
  ctrl.upload
);

// Add observacion (TECNICO, ADMIN)
router.post(
  '/:id/observacion',
  authorize('ADMIN', 'TECNICO'),
  upload.array('archivos', 5),
  handleMulterError,
  ctrl.observacionValidation,
  ctrl.addObservacion
);

// Add comentario (all roles)
router.post('/:id/comentario', ctrl.comentarioValidation, ctrl.addComentario);

module.exports = router;
