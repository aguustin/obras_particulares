const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, 'Errores de validación', errors.array());
  }
  next();
};

module.exports = { validate };
