const Category = require('../models/Category')
const Product = require('../models/Product')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all categories with product count
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    {
      $project: { products: 0 }
    },
    { $sort: { name: 1 } }
  ])

  return successResponse(res, { categories }, 'Categories fetched successfully')
}

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id).populate('createdBy', 'name email')
  if (!category) {
    return errorResponse(res, 'Category not found', 404)
  }
  return successResponse(res, { category }, 'Category fetched successfully')
}

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private (admin/manager)
 */
const createCategory = async (req, res) => {
  const { name, description, color, icon } = req.body

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
  if (existing) {
    return errorResponse(res, 'A category with this name already exists', 409)
  }

  const category = await Category.create({
    name,
    description,
    color,
    icon,
    createdBy: req.user._id
  })

  return successResponse(res, { category }, 'Category created successfully', 201)
}

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (admin/manager)
 */
const updateCategory = async (req, res) => {
  const { name, description, color, icon } = req.body

  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', 404)
  }

  // Check name uniqueness if name is being changed
  if (name && name !== category.name) {
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: category._id }
    })
    if (existing) {
      return errorResponse(res, 'A category with this name already exists', 409)
    }
    category.name = name
  }

  if (description !== undefined) category.description = description
  if (color !== undefined) category.color = color
  if (icon !== undefined) category.icon = icon

  await category.save()

  return successResponse(res, { category }, 'Category updated successfully')
}

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (admin/manager)
 */
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', 404)
  }

  // Check if any products use this category
  const productCount = await Product.countDocuments({ category: category._id })
  if (productCount > 0) {
    return errorResponse(
      res,
      `Cannot delete category. It is used by ${productCount} product(s). Reassign products first.`,
      400
    )
  }

  await Category.findByIdAndDelete(req.params.id)

  return successResponse(res, null, 'Category deleted successfully')
}

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory }
