const multer = require('multer');
const { badRequest } = require('../utils/apiResponse');

const storage = multer.memoryStorage();

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return badRequest(res, `Error de carga: ${err.message}`);
  }
  if (err) {
    return badRequest(res, err.message);
  }
  next();
};

module.exports = { upload, handleMulterError };
