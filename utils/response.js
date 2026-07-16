/**
 * Unified JSON response helpers.
 * All API responses follow the same shape:
 *   success responses  → { success: true,  ...payload }
 *   error responses    → { success: false, message: string, error: string }
 */

const sendSuccess = (res, payload = {}, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...payload });
};

const sendCreated = (res, payload = {}) => {
  sendSuccess(res, payload, 201);
};

const sendError = (res, message = "Internal Server Error", statusCode = 500, details) => {
  const body = {
    success: false,
    message,
    error: message,
  };

  if (details !== undefined) {
    body.details = details;
  }

  res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendCreated, sendError };
