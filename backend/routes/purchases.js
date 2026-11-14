const express = require('express')
const router = express.Router()
const {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  receivePurchase,
  cancelPurchase
} = require('../controllers/purchaseController')
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

router.get('/', getPurchases)
router.get('/:id', validateObjectId('id'), handleValidationErrors, getPurchase)
router.post('/', authorize('admin', 'manager'), createPurchase)
router.put('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, updatePurchase)

// Support both PUT and PATCH for receive & cancel
router.patch('/:id/receive', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, receivePurchase)
router.put('/:id/receive', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, receivePurchase)
router.post('/:id/receive', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, receivePurchase)

router.patch('/:id/cancel', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, cancelPurchase)
router.put('/:id/cancel', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, cancelPurchase)

module.exports = router
