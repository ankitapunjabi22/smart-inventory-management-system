const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errors = null

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }))
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message = `Duplicate value for field: ${field}. This ${field} already exists.`
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token has expired'
  }

  const response = {
    success: false,
    message
  }

  if (errors) {
    response.errors = errors
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
  }

  return res.status(statusCode).json(response)
}

module.exports = errorHandler
