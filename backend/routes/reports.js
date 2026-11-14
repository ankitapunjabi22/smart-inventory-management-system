const express = require('express')
const router = express.Router()
const { getInventoryReport, getSalesReport, getPurchaseReport } = require('../controllers/reportController')
const protect = require('../middleware/auth')

router.use(protect)

router.get('/inventory', getInventoryReport)
router.get('/sales', getSalesReport)
router.get('/purchases', getPurchaseReport)

module.exports = router
