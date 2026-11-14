const { param, validationResult } = require('express-validator')
const { errorResponse } = require('../utils/apiResponse')

/**
 * Validate that a route param is a valid MongoDB ObjectId
 * @param {string} paramName - The param name to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}: must be a valid MongoDB ObjectId`)
]

/**
 * Middleware: run validationResult and return 400 if there are errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array())
  }
  next()
}

module.exports = { validateObjectId, handleValidationErrors }
