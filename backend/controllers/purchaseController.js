const Purchase = require('../models/Purchase')
const Product = require('../models/Product')
const InventoryTransaction = require('../models/InventoryTransaction')
const Notification = require('../models/Notification')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all purchases (paginated, filterable)
 * @route   GET /api/purchases
 * @access  Private
 */
const getPurchases = async (req, res) => {
  const { page = 1, limit = 10, orderStatus, paymentStatus, supplier } = req.query

  const query = {}
  if (orderStatus) query.orderStatus = orderStatus
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (supplier) query.supplier = supplier

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  const total = await Purchase.countDocuments(query)
  const purchases = await Purchase.find(query)
    .populate('supplier', 'name companyName email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      purchases,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    },
    'Purchases fetched successfully'
  )
}

/**
 * @desc    Get single purchase
 * @route   GET /api/purchases/:id
 * @access  Private
 */
const getPurchase = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('supplier', 'name companyName email phone address')
    .populate('items.product', 'name sku purchasePrice')
    .populate('createdBy', 'name email')
    .populate('receivedBy', 'name email')

  if (!purchase) return errorResponse(res, 'Purchase not found', 404)

  return successResponse(res, { purchase }, 'Purchase fetched successfully')
}

/**
 * @desc    Create purchase order (does NOT increase stock)
 * @route   POST /api/purchases
 * @access  Private (admin/manager)
 */
const createPurchase = async (req, res) => {
  const { supplier, items, expectedDeliveryDate, paymentStatus, notes } = req.body

  if (!items || items.length === 0) {
    return errorResponse(res, 'Purchase must have at least one item', 400)
  }

  // Calculate total amounts for items
  const processedItems = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.quantity * item.unitPrice
  }))

  const totalAmount = processedItems.reduce((sum, item) => sum + item.totalPrice, 0)

  const purchase = await Purchase.create({
    supplier,
    items: processedItems,
    totalAmount,
    expectedDeliveryDate,
    paymentStatus: paymentStatus || 'pending',
    notes,
    createdBy: req.user._id
  })

  await purchase.populate([
    { path: 'supplier', select: 'name companyName email' },
    { path: 'items.product', select: 'name sku' }
  ])

  return successResponse(res, { purchase }, 'Purchase order created successfully', 201)
}

/**
 * @desc    Update purchase (only if status is pending)
 * @route   PUT /api/purchases/:id
 * @access  Private (admin/manager)
 */
const updatePurchase = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
  if (!purchase) return errorResponse(res, 'Purchase not found', 404)

  if (purchase.orderStatus !== 'pending') {
    return errorResponse(res, 'Only pending purchase orders can be updated', 400)
  }

  const { supplier, items, expectedDeliveryDate, paymentStatus, orderStatus, notes } = req.body

  if (items && items.length > 0) {
    purchase.items = items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }))
    purchase.totalAmount = purchase.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  if (supplier !== undefined) purchase.supplier = supplier
  if (expectedDeliveryDate !== undefined) purchase.expectedDeliveryDate = expectedDeliveryDate
  if (paymentStatus !== undefined) purchase.paymentStatus = paymentStatus
  if (orderStatus !== undefined) purchase.orderStatus = orderStatus
  if (notes !== undefined) purchase.notes = notes

  await purchase.save()

  return successResponse(res, { purchase }, 'Purchase order updated successfully')
}

/**
 * @desc    Receive purchase — increase stock for all items
 * @route   PATCH /api/purchases/:id/receive
 * @access  Private (admin/manager)
 */
const receivePurchase = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id).populate('items.product')
  if (!purchase) return errorResponse(res, 'Purchase not found', 404)

  if (purchase.orderStatus === 'received') {
    return errorResponse(res, 'This purchase order has already been received', 400)
  }

  if (purchase.orderStatus === 'cancelled') {
    return errorResponse(res, 'Cannot receive a cancelled purchase order', 400)
  }

  // Update stock for each item
  for (const item of purchase.items) {
    const product = await Product.findById(item.product._id || item.product)
    if (!product) continue

    const previousQuantity = product.quantity
    product.quantity += item.quantity
    await product.save()

    // Create inventory transaction
    await InventoryTransaction.create({
      product: product._id,
      transactionType: 'purchase',
      quantity: item.quantity,
      previousQuantity,
      newQuantity: product.quantity,
      reference: { type: 'Purchase', id: purchase._id },
      reason: `Purchase order received: ${purchase.purchaseOrderId}`,
      createdBy: req.user._id
    })
  }

  // Update purchase status
  purchase.orderStatus = 'received'
  purchase.receivedAt = new Date()
  purchase.receivedBy = req.user._id
  purchase.totalAmount = purchase.items.reduce((sum, item) => sum + item.totalPrice, 0)
  await purchase.save()

  // Create notification
  await Notification.create({
    title: 'Purchase Order Received',
    message: `Purchase order ${purchase.purchaseOrderId} has been received and stock updated.`,
    type: 'new_purchase',
    priority: 'medium',
    relatedTo: { model: 'Purchase', id: purchase._id },
    createdBy: req.user._id
  })

  // Emit socket event
  if (req.io) {
    req.io.emit('newPurchase', { purchase })
  }

  await purchase.populate([
    { path: 'supplier', select: 'name companyName email' },
    { path: 'items.product', select: 'name sku quantity' }
  ])

  return successResponse(res, { purchase }, 'Purchase order received and stock updated successfully')
}

/**
 * @desc    Cancel purchase
 * @route   PATCH /api/purchases/:id/cancel
 * @access  Private (admin/manager)
 */
const cancelPurchase = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
  if (!purchase) return errorResponse(res, 'Purchase not found', 404)

  if (!['pending', 'ordered'].includes(purchase.orderStatus)) {
    return errorResponse(res, 'Only pending or ordered purchases can be cancelled', 400)
  }

  purchase.orderStatus = 'cancelled'
  await purchase.save()

  return successResponse(res, { purchase }, 'Purchase order cancelled successfully')
}

module.exports = {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  receivePurchase,
  cancelPurchase
}
