const Product = require('../models/Product')
const InventoryTransaction = require('../models/InventoryTransaction')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Stock In — increase product quantity
 * @route   POST /api/inventory/stock-in
 * @access  Private
 */
const stockIn = async (req, res) => {
  const { productId, product: prodParam, quantity, reason, notes } = req.body
  const targetId = productId || prodParam

  if (!targetId) return errorResponse(res, 'Product ID is required', 400)
  if (!quantity || Number(quantity) <= 0) return errorResponse(res, 'Quantity must be greater than 0', 400)

  const product = await Product.findById(targetId)
  if (!product) return errorResponse(res, 'Product not found', 404)

  const previousQuantity = product.quantity
  product.quantity += parseInt(quantity, 10)
  await product.save()

  const transaction = await InventoryTransaction.create({
    product: product._id,
    transactionType: 'stock_in',
    quantity: parseInt(quantity, 10),
    previousQuantity,
    newQuantity: product.quantity,
    reference: { type: 'Manual' },
    reason: reason || 'Manual Stock In',
    notes,
    createdBy: req.user._id
  })

  if (req.io) {
    req.io.emit('stockUpdated', {
      productName: product.name,
      quantity: product.quantity,
      transaction
    })
  }

  return successResponse(
    res,
    { product, transaction },
    `Stock increased by ${quantity}. Current stock: ${product.quantity}`
  )
}

/**
 * @desc    Stock Out — decrease product quantity
 * @route   POST /api/inventory/stock-out
 * @access  Private
 */
const stockOut = async (req, res) => {
  const { productId, product: prodParam, quantity, reason, notes } = req.body
  const targetId = productId || prodParam

  if (!targetId) return errorResponse(res, 'Product ID is required', 400)
  if (!quantity || Number(quantity) <= 0) return errorResponse(res, 'Quantity must be greater than 0', 400)

  const product = await Product.findById(targetId)
  if (!product) return errorResponse(res, 'Product not found', 404)

  if (product.quantity < parseInt(quantity, 10)) {
    return errorResponse(
      res,
      `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`,
      400
    )
  }

  const previousQuantity = product.quantity
  product.quantity -= parseInt(quantity, 10)
  await product.save()

  const transaction = await InventoryTransaction.create({
    product: product._id,
    transactionType: 'stock_out',
    quantity: parseInt(quantity, 10),
    previousQuantity,
    newQuantity: product.quantity,
    reference: { type: 'Manual' },
    reason: reason || 'Manual Stock Out',
    notes,
    createdBy: req.user._id
  })

  if (req.io) {
    req.io.emit('stockUpdated', {
      productName: product.name,
      quantity: product.quantity,
      transaction
    })

    if (product.quantity <= product.minStockLevel && product.quantity > 0) {
      req.io.emit('lowStockAlert', {
        productName: product.name,
        quantity: product.quantity
      })
    } else if (product.quantity === 0) {
      req.io.emit('outOfStockAlert', {
        productName: product.name
      })
    }
  }

  return successResponse(
    res,
    { product, transaction },
    `Stock decreased by ${quantity}. Remaining stock: ${product.quantity}`
  )
}

/**
 * @desc    Adjustment — set quantity to a specific value
 * @route   POST /api/inventory/adjustment
 * @access  Private
 */
const adjustment = async (req, res) => {
  const { productId, product: prodParam, newQuantity, quantity, reason, notes } = req.body
  const targetId = productId || prodParam
  const targetQty = newQuantity !== undefined ? newQuantity : quantity

  if (!targetId) return errorResponse(res, 'Product ID is required', 400)
  if (targetQty === undefined || Number(targetQty) < 0) {
    return errorResponse(res, 'Target quantity must be 0 or greater', 400)
  }

  const product = await Product.findById(targetId)
  if (!product) return errorResponse(res, 'Product not found', 404)

  const previousQuantity = product.quantity
  const finalQty = parseInt(targetQty, 10)
  const quantityChange = Math.abs(finalQty - previousQuantity)
  product.quantity = finalQty
  await product.save()

  const transaction = await InventoryTransaction.create({
    product: product._id,
    transactionType: 'adjustment',
    quantity: quantityChange,
    previousQuantity,
    newQuantity: product.quantity,
    reference: { type: 'Manual' },
    reason: reason || 'Inventory count reconciliation',
    notes,
    createdBy: req.user._id
  })

  if (req.io) {
    req.io.emit('stockUpdated', {
      productName: product.name,
      quantity: product.quantity,
      transaction
    })
  }

  return successResponse(
    res,
    { product, transaction },
    `Stock adjusted from ${previousQuantity} to ${product.quantity}`
  )
}

/**
 * @desc    Get inventory transactions (paginated)
 * @route   GET /api/inventory/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
  const { page = 1, limit = 10, productId, type } = req.query

  const query = {}
  if (productId) query.product = productId
  if (type) query.transactionType = type

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  const total = await InventoryTransaction.countDocuments(query)
  const transactions = await InventoryTransaction.find(query)
    .populate('product', 'name sku unit')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    },
    'Transactions fetched successfully'
  )
}

module.exports = { stockIn, stockOut, adjustment, getTransactions }
