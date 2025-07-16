const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { TokenError } = require('../handler/error/TokenError');
const errorLogger = require('../logging/handlers/errorLogger');

const errorHandler = async function (error, req, res, next) {
  // Log error with context
  errorLogger.logError(error, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip
  });
  if (error instanceof InvalidInputError) {
    return res.status(400)
      .json({
        status: 'input_error',
        message: error.message,
      });
  }
  if (error instanceof TokenError) {
    return res.status(401).json({
      status: 'token_error',
      message: error.message,
    });
  }
  return res.status(500).json({
    status: 'server_error',
    message: error.message ? error.message : 'Something went wrong',
  });
};

module.exports = errorHandler;
