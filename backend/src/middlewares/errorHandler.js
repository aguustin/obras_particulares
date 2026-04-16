const logger = require('../utils/logger');

const isConnectionError = (err) =>
  err.name === 'AggregateError' ||
  err.code === 'ECONNREFUSED' ||
  err.errors?.some?.((e) => e.code === 'ECONNREFUSED');

const errorHandler = (err, req, res, next) => {
  // Determinar status y mensaje antes de loggear
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Errores de red / servicio no disponible
  if (isConnectionError(err)) {
    status = 503;
    message = 'Servicio no disponible. Verificá que todos los servicios estén corriendo.';
  }

  // Mongoose: error de validación
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Error de validación';
    const errors = Object.values(err.errors).map((e) => ({ msg: e.message, param: e.path }));
    logger.warn(`${req.method} ${req.path} - ValidationError`);
    return res.status(status).json({ success: false, message, errors });
  }

  // Mongoose: clave duplicada
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Valor duplicado para: ${field}`;
    logger.warn(`${req.method} ${req.path} - DuplicateKey: ${field}`);
    return res.status(status).json({ success: false, message });
  }

  // Mongoose: cast error (ID inválido)
  if (err.name === 'CastError') {
    status = 400;
    message = `ID inválido: ${err.value}`;
    logger.warn(`${req.method} ${req.path} - CastError: ${err.value}`);
    return res.status(status).json({ success: false, message });
  }

  // Log general (solo errores >= 500 con stack trace)
  if (status >= 500) {
    logger.error(`${req.method} ${req.path} - [${err.name || 'Error'}] ${message}`, {
      stack: err.stack || (err.errors?.map?.((e) => e.stack).join('\n')),
    });
  } else {
    logger.warn(`${req.method} ${req.path} - ${status}: ${message}`);
  }

  return res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
