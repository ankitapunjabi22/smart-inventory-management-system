const express = require('express')
const router = express.Router()
const {
  getStats,
  getSalesChart,
  getPurchaseChart,
  getLowStockProducts,
  getRecentSales,
  getRecentPurchases
} = require('../controllers/dashboardController')
const protect = require('../middleware/auth')

router.use(protect)

router.get('/stats', getStats)
router.get('/sales-chart', getSalesChart)
router.get('/purchase-chart', getPurchaseChart)
router.get('/low-stock', getLowStockProducts)
router.get('/recent-sales', getRecentSales)
router.get('/recent-purchases', getRecentPurchases)

module.exports = router
