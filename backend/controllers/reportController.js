const Product = require('../models/Product')
const Sale = require('../models/Sale')
const Purchase = require('../models/Purchase')
const { successResponse } = require('../utils/apiResponse')

/**
 * @desc    Get inventory report — all products with value calculations
 * @route   GET /api/reports/inventory
 * @access  Private
 */
const getInventoryReport = async (req, res) => {
  const { category, supplier, isActive } = req.query

  const matchStage = {}
  if (category) matchStage.category = { $toObjectId: category }
  if (supplier) matchStage.supplier = { $toObjectId: supplier }
  if (isActive !== undefined) matchStage.isActive = isActive === 'true'

  const products = await Product.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier'
      }
    },
    { $unwind: { path: '$supplier', preserveNullAndEmpty: true } },
    {
      $addFields: {
        inventoryValue: { $multiply: ['$quantity', '$purchasePrice'] }
      }
    },
    { $sort: { name: 1 } }
  ])

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.inventoryValue || 0), 0)
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length
  const outOfStockProducts = products.filter((p) => p.quantity === 0).length

  return successResponse(
    res,
    {
      products,
      summary: {
        totalProducts,
        totalInventoryValue,
        lowStockProducts,
        outOfStockProducts
      }
    },
    'Inventory report fetched successfully'
  )
}

/**
 * @desc    Get sales report with optional date range filter
 * @route   GET /api/reports/sales
 * @access  Private
 */
const getSalesReport = async (req, res) => {
  const { startDate, endDate, paymentMethod, paymentStatus } = req.query

  const query = {}

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  if (paymentMethod) query.paymentMethod = paymentMethod
  if (paymentStatus) query.paymentStatus = paymentStatus

  const sales = await Sale.find(query)
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalItems = sales.reduce((sum, s) => sum + s.items.length, 0)

  return successResponse(
    res,
    {
      sales,
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalItems
      }
    },
    'Sales report fetched successfully'
  )
}

/**
 * @desc    Get purchase report with optional date range filter
 * @route   GET /api/reports/purchases
 * @access  Private
 */
const getPurchaseReport = async (req, res) => {
  const { startDate, endDate, orderStatus, paymentStatus, supplier } = req.query

  const query = {}

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  if (orderStatus) query.orderStatus = orderStatus
  if (paymentStatus) query.paymentStatus = paymentStatus
  if (supplier) query.supplier = supplier

  const purchases = await Purchase.find(query)
    .populate('supplier', 'name companyName email')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0)

  return successResponse(
    res,
    {
      purchases,
      summary: {
        totalPurchases: purchases.length,
        totalSpent
      }
    },
    'Purchase report fetched successfully'
  )
}

module.exports = { getInventoryReport, getSalesReport, getPurchaseReport }
