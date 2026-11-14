const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    }
  },
  { _id: false }
)

const purchaseSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: String,
      unique: true,
      default: () => `PO-${uuidv4().split('-')[0].toUpperCase()}`
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required']
    },
    items: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      default: 0
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    expectedDeliveryDate: {
      type: Date
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'ordered', 'received', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    },
    receivedAt: {
      type: Date
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Purchase', purchaseSchema)
