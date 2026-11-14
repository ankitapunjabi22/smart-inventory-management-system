const { errorResponse } = require('../utils/apiResponse')

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', 401)
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      )
    }

    next()
  }
}

module.exports = authorize
