const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/padrones', require('./padronRoutes'));
router.use('/expedientes', require('./expedienteRoutes'));
router.use('/planos', require('./planoRoutes'));
router.use('/versiones', require('./versionRoutes'));

module.exports = router;
