const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return errorResponse(res, 'A user with this email already exists', 409)
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff'
  })

  const token = generateToken(user._id)

  return successResponse(
    res,
    {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    },
    'User registered successfully',
    201
  )
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body

  // Find user including password field
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  if (!user.isActive) {
    return errorResponse(res, 'Your account has been deactivated. Contact admin.', 401)
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  // Update lastLogin
  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = generateToken(user._id)

  return successResponse(
    res,
    {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    },
    'Login successful'
  )
}

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
  return successResponse(res, { user }, 'User fetched successfully')
}

/**
 * @desc    Logout user (stateless JWT — client removes token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully')
}

module.exports = { register, login, getMe, logout }
