const logger = require('../../services/logger');
const errorHandler = require('../../middleware/error');

const requestHandler = async function (req, res, controllerFunction) {
  try {
    const reponseofControllerFunction = await controllerFunction(req);
    res
      .status(reponseofControllerFunction.getStatusCode())
      .json(reponseofControllerFunction.getBody());
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  requestHandler,
};
