const express = require('express')
const router = express.Router()
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController')
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { validateObjectId, handleValidationErrors } = require('../validators/commonValidator')

router.use(protect)

router.get('/', getCategories)
router.get('/:id', validateObjectId('id'), handleValidationErrors, getCategory)
router.post('/', authorize('admin', 'manager'), createCategory)
router.put('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, updateCategory)
router.delete('/:id', authorize('admin', 'manager'), validateObjectId('id'), handleValidationErrors, deleteCategory)

module.exports = router
