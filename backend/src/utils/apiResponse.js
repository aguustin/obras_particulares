const success = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Created') => {
  return res.status(201).json({ success: true, message, data });
};

const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = 'Resource not found') => error(res, message, 404);
const forbidden = (res, message = 'Forbidden') => error(res, message, 403);
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);
const badRequest = (res, message = 'Bad request', errors = null) => error(res, message, 400, errors);

module.exports = { success, created, error, notFound, forbidden, unauthorized, badRequest };
