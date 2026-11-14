const Sale = require('../models/Sale')
const Product = require('../models/Product')
const InventoryTransaction = require('../models/InventoryTransaction')
const Notification = require('../models/Notification')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all sales (paginated)
 * @route   GET /api/sales
 * @access  Private
 */
const getSales = async (req, res) => {
  const { page = 1, limit = 10, paymentStatus, paymentMethod } = req.query

  const query = {}
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (paymentMethod) query.paymentMethod = paymentMethod

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  const total = await Sale.countDocuments(query)
  const sales = await Sale.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      sales,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    },
    'Sales fetched successfully'
  )
}

/**
 * @desc    Get single sale
 * @route   GET /api/sales/:id
 * @access  Private
 */
const getSale = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate('items.product', 'name sku sellingPrice image')
    .populate('createdBy', 'name email')

  if (!sale) return errorResponse(res, 'Sale not found', 404)

  return successResponse(res, { sale }, 'Sale fetched successfully')
}

/**
 * @desc    Create sale — validate stock, deduct, create transactions
 * @route   POST /api/sales
 * @access  Private
 */
const createSale = async (req, res) => {
  const {
    customer,
    items,
    discount = 0,
    tax = 0,
    paymentMethod = 'cash',
    paymentStatus = 'paid',
    notes
  } = req.body

  if (!items || items.length === 0) {
    return errorResponse(res, 'Sale must have at least one item', 400)
  }

  // Step 1: Validate ALL items have sufficient stock before making any changes
  const productDetails = []
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) {
      return errorResponse(res, `Product not found: ${item.product}`, 404)
    }
    if (!product.isActive) {
      return errorResponse(res, `Product "${product.name}" is inactive`, 400)
    }
    if (product.quantity < item.quantity) {
      return errorResponse(
        res,
        `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
        400
      )
    }
    productDetails.push({ product, requestedQty: item.quantity })
  }

  // Step 2: Process items — deduct stock and build sale items
  const saleItems = []
  const lowStockAlerts = []

  for (let i = 0; i < items.length; i++) {
    const { product, requestedQty } = productDetails[i]
    const item = items[i]

    const unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.sellingPrice
    const itemDiscount = item.discount || 0
    const totalPrice = unitPrice * requestedQty - itemDiscount

    // Deduct stock
    const previousQuantity = product.quantity
    product.quantity -= requestedQty
    await product.save()

    // Create inventory transaction
    await InventoryTransaction.create({
      product: product._id,
      transactionType: 'sale',
      quantity: requestedQty,
      previousQuantity,
      newQuantity: product.quantity,
      reference: { type: 'Sale' },
      reason: 'Sale',
      createdBy: req.user._id
    })

    saleItems.push({
      product: product._id,
      quantity: requestedQty,
      unitPrice,
      discount: itemDiscount,
      totalPrice
    })

    // Check if product is now low stock
    if (product.quantity <= product.minStockLevel) {
      lowStockAlerts.push(product)
    }
  }

  // Step 3: Calculate totals
  const subtotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalAmount = subtotal - (discount || 0) + (tax || 0)

  // Step 4: Create the sale record
  const sale = await Sale.create({
    customer,
    items: saleItems,
    subtotal,
    discount: discount || 0,
    tax: tax || 0,
    totalAmount,
    paymentMethod,
    paymentStatus,
    notes,
    createdBy: req.user._id
  })

  // Update sale transaction references with actual sale ID
  await InventoryTransaction.updateMany(
    { 'reference.type': 'Sale', 'reference.id': null, createdBy: req.user._id },
    { $set: { 'reference.id': sale._id } }
  )

  // Step 5: Create notification
  await Notification.create({
    title: 'New Sale Created',
    message: `Sale ${sale.saleId} for ₹${totalAmount.toFixed(2)} has been created.`,
    type: 'new_sale',
    priority: 'low',
    relatedTo: { model: 'Sale', id: sale._id },
    createdBy: req.user._id
  })

  // Step 6: Emit socket events
  if (req.io) {
    req.io.emit('newSale', { sale })

    // Emit low stock alerts
    for (const product of lowStockAlerts) {
      req.io.emit('lowStockAlert', {
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          minStockLevel: product.minStockLevel
        }
      })
    }
  }

  await sale.populate([
    { path: 'items.product', select: 'name sku' },
    { path: 'createdBy', select: 'name email' }
  ])

  return successResponse(res, { sale }, 'Sale created successfully', 201)
}

module.exports = { getSales, getSale, createSale }
