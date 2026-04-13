const { verifyToken } = require('../services/authService');
const { unauthorized } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return unauthorized(res);

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return unauthorized(res, 'Token inválido o expirado');
  }
};

module.exports = { authenticate };
