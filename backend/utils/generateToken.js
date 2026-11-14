const jwt = require('jsonwebtoken')

/**
 * Generate a signed JWT for the given user id
 * @param {string} id - MongoDB ObjectId of the user
 * @returns {string} signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

module.exports = generateToken
