const Notification = require('../models/Notification')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  // Build query: notifications where current user is in recipients OR no specific recipients (broadcast)
  const query = {
    $or: [
      { 'recipients.user': req.user._id },
      { recipients: { $size: 0 } }
    ]
  }

  if (unread === 'true') {
    query.$or = [
      {
        'recipients.user': req.user._id,
        'recipients.isRead': false
      },
      {
        recipients: { $size: 0 },
        isRead: false
      }
    ]
  }

  const total = await Notification.countDocuments(query)
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      notifications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    },
    'Notifications fetched successfully'
  )
}

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) return errorResponse(res, 'Notification not found', 404)

  // If notification has recipients, mark the current user's entry
  const recipientIndex = notification.recipients.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  )

  if (recipientIndex !== -1) {
    notification.recipients[recipientIndex].isRead = true
    notification.recipients[recipientIndex].readAt = new Date()
  } else {
    // Broadcast notification
    notification.isRead = true
    notification.readAt = new Date()
  }

  await notification.save()

  return successResponse(res, { notification }, 'Notification marked as read')
}

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  const now = new Date()

  // Update broadcast notifications
  await Notification.updateMany(
    { recipients: { $size: 0 }, isRead: false },
    { $set: { isRead: true, readAt: now } }
  )

  // Update user-specific notifications
  await Notification.updateMany(
    { 'recipients.user': req.user._id, 'recipients.isRead': false },
    {
      $set: {
        'recipients.$[elem].isRead': true,
        'recipients.$[elem].readAt': now
      }
    },
    {
      arrayFilters: [{ 'elem.user': req.user._id, 'elem.isRead': false }]
    }
  )

  return successResponse(res, null, 'All notifications marked as read')
}

/**
 * @desc    Get unread notification count for badge
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  const broadcastUnread = await Notification.countDocuments({
    recipients: { $size: 0 },
    isRead: false
  })

  const userUnread = await Notification.countDocuments({
    'recipients.user': req.user._id,
    'recipients.isRead': false
  })

  const count = broadcastUnread + userUnread

  return successResponse(res, { count }, 'Unread count fetched successfully')
}

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount }
