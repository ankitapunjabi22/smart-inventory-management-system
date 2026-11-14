const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const saleItemSchema = new mongoose.Schema(
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
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    }
  },
  { _id: false }
)

const saleSchema = new mongoose.Schema(
  {
    saleId: {
      type: String,
      unique: true,
      default: () => `SALE-${uuidv4().split('-')[0].toUpperCase()}`
    },
    customer: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true }
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'paid'
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sale', saleSchema)
