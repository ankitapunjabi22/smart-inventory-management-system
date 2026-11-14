const express = require('express')
const router = express.Router()
const { register, login, getMe, logout } = require('../controllers/authController')
const protect = require('../middleware/auth')
const { registerValidator, loginValidator } = require('../validators/authValidator')
const { handleValidationErrors } = require('../validators/commonValidator')

router.post('/register', registerValidator, handleValidationErrors, register)
router.post('/login', loginValidator, handleValidationErrors, login)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

module.exports = router
