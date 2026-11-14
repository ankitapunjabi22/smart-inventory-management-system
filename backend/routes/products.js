const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  uploadProductImage
} = require('../controllers/productController')
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const upload = require('../middleware/upload')
const { createProductValidator, updateProductValidator } = require('../validators/productValidator')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

// Special routes MUST come before /:id to avoid route conflicts
router.get('/low-stock', getLowStockProducts)

router.get('/', getProducts)
router.get('/:id', validateObjectId('id'), handleValidationErrors, getProduct)
router.post('/', authorize('admin', 'manager'), createProductValidator, handleValidationErrors, createProduct)
router.put('/:id', authorize('admin', 'manager'), validateObjectId('id'), updateProductValidator, handleValidationErrors, updateProduct)
router.delete('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, deleteProduct)
router.post('/:id/image', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, upload.single('image'), uploadProductImage)

module.exports = router
