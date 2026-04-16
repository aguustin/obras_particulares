const router = require('express').Router();
const ctrl = require('../controllers/versionPlanoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { upload, handleMulterError } = require('../middlewares/upload');

router.use(authenticate);

router.get('/plano/:planoId', ctrl.getByPlano);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.getDownloadUrl);

// Upload new version (PROFESIONAL, TECNICO, ADMIN) — acepta hasta 10 PDFs
router.post(
  '/plano/:planoId',
  upload.array('pdf', 10),
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

// Edit version description (PROFESIONAL, ADMIN) — only while editable
router.patch(
  '/:id',
  authorize('ADMIN', 'PROFESIONAL'),
  ctrl.updateDescripcion
);

// Replace version files (PROFESIONAL, ADMIN) — only while editable
router.patch(
  '/:id/archivos',
  authorize('ADMIN', 'PROFESIONAL'),
  upload.array('pdf', 10),
  handleMulterError,
  ctrl.updateArchivos
);

// Add comentario (all roles)
router.post('/:id/comentario', ctrl.comentarioValidation, ctrl.addComentario);

module.exports = router;
