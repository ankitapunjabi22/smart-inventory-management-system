const express = require('express')
const router = express.Router()
const { getSales, getSale, createSale } = require('../controllers/saleController')
const protect = require('../middleware/auth')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

router.get('/', getSales)
router.get('/:id', validateObjectId('id'), handleValidationErrors, getSale)
router.post('/', createSale)

module.exports = router
