const express = require('express')
const router = express.Router()
const {
  getUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  changePassword
} = require('../controllers/userController')
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

// Own profile routes
router.patch('/profile', updateProfile)
router.put('/profile', updateProfile)

router.patch('/change-password', changePassword)
router.put('/change-password', changePassword)

// Admin-only routes
router.get('/', authorize('admin'), getUsers)

router.patch('/:id/role', authorize('admin'), validateObjectId('id'), handleValidationErrors, updateUserRole)
router.put('/:id/role', authorize('admin'), validateObjectId('id'), handleValidationErrors, updateUserRole)

router.delete('/:id', authorize('admin'), validateObjectId('id'), handleValidationErrors, deleteUser)

module.exports = router
