const { forbidden } = require('../utils/apiResponse');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return forbidden(res);
  if (!roles.includes(req.user.rol)) return forbidden(res, `Acceso restringido a: ${roles.join(', ')}`);
  next();
};

module.exports = { authorize };
