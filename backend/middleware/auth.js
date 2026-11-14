const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { errorResponse } = require('../utils/apiResponse')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token provided', 401)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return errorResponse(res, 'Not authorized, user not found', 401)
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 401)
    }

    req.user = user
    next()
  } catch (error) {
    return errorResponse(res, 'Not authorized, token is invalid', 401)
  }
}

module.exports = protect
