const mongoose = require('mongoose')

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    transactionType: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'sale', 'purchase'],
      required: [true, 'Transaction type is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required']
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    reference: {
      type: {
        type: String,
        enum: ['Sale', 'Purchase', 'Manual']
      },
      id: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    reason: {
      type: String,
      trim: true
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

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema)
