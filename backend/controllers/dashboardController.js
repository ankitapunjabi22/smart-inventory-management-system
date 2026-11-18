const Product = require('../models/Product')
const Category = require('../models/Category')
const Supplier = require('../models/Supplier')
const Sale = require('../models/Sale')
const Purchase = require('../models/Purchase')
const { successResponse } = require('../utils/apiResponse')

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    totalSales,
    totalPurchases,
    inventoryValueResult,
    lowStockCount,
    outOfStockCount,
    monthlyRevenueResult
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Category.countDocuments(),
    Supplier.countDocuments({ isActive: true }),
    Sale.countDocuments(),
    Purchase.countDocuments(),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } }
        }
      }
    ]),
    Product.countDocuments({
      isActive: true,
      $expr: { $and: [{ $lte: ['$quantity', '$minStockLevel'] }, { $gt: ['$quantity', 0] }] }
    }),
    Product.countDocuments({ isActive: true, quantity: 0 }),
    Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: 'paid'
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ])

  return successResponse(
    res,
    {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalSales,
      totalPurchases,
      totalInventoryValue: inventoryValueResult[0]?.totalValue || 0,
      lowStockCount,
      outOfStockCount,
      monthlyRevenue: monthlyRevenueResult[0]?.total || 0
    },
    'Dashboard stats fetched successfully'
  )
}

/**
 * @desc    Get monthly sales chart data for last 6 months
 * @route   GET /api/dashboard/sales-chart
 * @access  Private
 */
const getSalesChart = async (req, res) => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const salesData = await Sale.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRevenue: { $sum: '$totalAmount' },
        totalSales: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  // Build full 6-month continuous timeline
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const fullChart = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const yr = d.getFullYear()
    const mo = d.getMonth() + 1
    const match = salesData.find(s => s._id.year === yr && s._id.month === mo)
    fullChart.push({
      year: yr,
      month: mo,
      label: `${monthNames[mo]} ${yr}`,
      totalRevenue: match ? match.totalRevenue : 0,
      totalSales: match ? match.totalSales : 0
    })
  }

  return successResponse(res, { salesChart: fullChart }, 'Sales chart data fetched successfully')
}

/**
 * @desc    Get monthly purchase chart data for last 6 months
 * @route   GET /api/dashboard/purchase-chart
 * @access  Private
 */
const getPurchaseChart = async (req, res) => {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const purchaseData = await Purchase.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalAmount: { $sum: '$totalAmount' },
        totalPurchases: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  // Build full 6-month continuous timeline
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const fullChart = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const yr = d.getFullYear()
    const mo = d.getMonth() + 1
    const match = purchaseData.find(p => p._id.year === yr && p._id.month === mo)
    fullChart.push({
      year: yr,
      month: mo,
      label: `${monthNames[mo]} ${yr}`,
      totalAmount: match ? match.totalAmount : 0,
      totalPurchases: match ? match.totalPurchases : 0
    })
  }

  return successResponse(res, { purchaseChart: fullChart }, 'Purchase chart data fetched successfully')
}

/**
 * @desc    Get low stock products (limit 10)
 * @route   GET /api/dashboard/low-stock
 * @access  Private
 */
const getLowStockProducts = async (req, res) => {
  const products = await Product.aggregate([
    {
      $match: {
        isActive: true,
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $sort: { quantity: 1 } },
    { $limit: 10 }
  ])

  return successResponse(res, { products }, 'Low stock products fetched successfully')
}

/**
 * @desc    Get recent sales (last 5)
 * @route   GET /api/dashboard/recent-sales
 * @access  Private
 */
const getRecentSales = async (req, res) => {
  const sales = await Sale.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5)

  return successResponse(res, { sales }, 'Recent sales fetched successfully')
}

/**
 * @desc    Get recent purchases (last 5)
 * @route   GET /api/dashboard/recent-purchases
 * @access  Private
 */
const getRecentPurchases = async (req, res) => {
  const purchases = await Purchase.find()
    .populate('supplier', 'name companyName')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5)

  return successResponse(res, { purchases }, 'Recent purchases fetched successfully')
}

module.exports = {
  getStats,
  getSalesChart,
  getPurchaseChart,
  getLowStockProducts,
  getRecentSales,
  getRecentPurchases
}
