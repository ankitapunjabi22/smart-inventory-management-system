const { body } = require('express-validator')

const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),

  body('sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required')
    .isFloat({ gt: 0 })
    .withMessage('Selling price must be greater than 0'),

  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be 0 or greater'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be 0 or greater'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Supplier must be a valid MongoDB ObjectId')
]

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),

  body('sellingPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Selling price must be greater than 0'),

  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be 0 or greater'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be 0 or greater'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),

  body('supplier')
    .optional()
    .isMongoId()
    .withMessage('Supplier must be a valid MongoDB ObjectId')
]

module.exports = { createProductValidator, updateProductValidator }
