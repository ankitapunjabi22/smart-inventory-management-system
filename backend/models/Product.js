const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, 'SKU cannot exceed 50 characters']
    },
    barcode: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
      type: String
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: 0
    },
    sellingPrice: {
      type: Number,
      min: [0, 'Selling price cannot be negative'],
      default: 0
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Min stock level cannot be negative']
    },
    maxStockLevel: {
      type: Number,
      min: [0, 'Max stock level cannot be negative']
    },
    expiryDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual: inventoryValue
productSchema.virtual('inventoryValue').get(function () {
  return this.quantity * this.purchasePrice
})

// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel && this.quantity > 0
})

// Virtual: isOutOfStock
productSchema.virtual('isOutOfStock').get(function () {
  return this.quantity === 0
})

// Pre-save: uppercase SKU
productSchema.pre('save', function () {
  if (this.sku) {
    this.sku = this.sku.toUpperCase()
  }
})

module.exports = mongoose.model('Product', productSchema)
