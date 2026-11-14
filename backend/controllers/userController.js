const User = require('../models/User')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private (admin)
 */
const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  return successResponse(res, { users }, 'Users fetched successfully')
}

/**
 * @desc    Update user role (admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private (admin)
 */
const updateUserRole = async (req, res) => {
  const { role } = req.body

  if (!role || !['admin', 'manager', 'staff'].includes(role)) {
    return errorResponse(res, 'Invalid role. Must be admin, manager, or staff', 400)
  }

  const user = await User.findById(req.params.id).select('-password')
  if (!user) return errorResponse(res, 'User not found', 404)

  if (user._id.toString() === req.user._id.toString()) {
    return errorResponse(res, 'You cannot change your own role', 400)
  }

  user.role = role
  await user.save()

  return successResponse(res, { user }, 'User role updated successfully')
}

/**
 * @desc    Delete user (admin only, cannot delete own account)
 * @route   DELETE /api/users/:id
 * @access  Private (admin)
 */
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return errorResponse(res, 'You cannot delete your own account', 400)
  }

  const user = await User.findById(req.params.id)
  if (!user) return errorResponse(res, 'User not found', 404)

  await User.findByIdAndDelete(req.params.id)

  return successResponse(res, null, 'User deleted successfully')
}

/**
 * @desc    Update own profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const { name, email } = req.body

  const user = await User.findById(req.user._id)

  if (email && email !== user.email) {
    const existing = await User.findOne({ email, _id: { $ne: user._id } })
    if (existing) {
      return errorResponse(res, 'This email is already in use', 409)
    }
    user.email = email
  }

  if (name) user.name = name

  await user.save()

  const updatedUser = await User.findById(user._id).select('-password')
  return successResponse(res, { user: updatedUser }, 'Profile updated successfully')
}

/**
 * @desc    Change own password
 * @route   PATCH /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 'Current password and new password are required', 400)
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 'New password must be at least 6 characters', 400)
  }

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    return errorResponse(res, 'Current password is incorrect', 401)
  }

  user.password = newPassword
  await user.save()

  return successResponse(res, null, 'Password changed successfully')
}

module.exports = { getUsers, updateUserRole, deleteUser, updateProfile, changePassword }
