const logger = require('./logger')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  return next(error)
}

module.exports = {
  errorHandler,
}
