const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'new_sale', 'new_purchase', 'stock_update', 'system'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    relatedTo: {
      model: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId }
    },
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        isRead: {
          type: Boolean,
          default: false
        },
        readAt: {
          type: Date
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
