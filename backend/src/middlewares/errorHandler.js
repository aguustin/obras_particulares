const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ msg: e.message, param: e.path }));
    return res.status(400).json({ success: false, message: 'Error de validación', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ success: false, message: `Valor duplicado para: ${field}` });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `ID inválido: ${err.value}` });
  }

  return res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
