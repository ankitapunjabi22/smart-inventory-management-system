const express = require('express')
const router = express.Router()
const { stockIn, stockOut, adjustment, getTransactions } = require('../controllers/inventoryController')
const protect = require('../middleware/auth')

router.use(protect)

router.post('/stock-in', stockIn)
router.post('/stock-out', stockOut)
router.post('/adjustment', adjustment)
router.get('/transactions', getTransactions)

module.exports = router
