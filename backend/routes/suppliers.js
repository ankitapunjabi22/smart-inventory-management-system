const express = require('express')
const router = express.Router()
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController')
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

router.get('/', getSuppliers)
router.get('/:id', validateObjectId('id'), handleValidationErrors, getSupplier)
router.post('/', authorize('admin', 'manager'), createSupplier)
router.put('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, updateSupplier)
router.delete('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, deleteSupplier)

module.exports = router
