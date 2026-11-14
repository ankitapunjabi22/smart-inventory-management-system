const express = require('express')
const router = express.Router()
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController')
const protect = require('../middleware/auth')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)

// Support both PUT and PATCH
router.patch('/mark-all-read', markAllAsRead)
router.put('/mark-all-read', markAllAsRead)

router.patch('/:id/read', validateObjectId('id'), handleValidationErrors, markAsRead)
router.put('/:id/read', validateObjectId('id'), handleValidationErrors, markAsRead)

module.exports = router
