const Product = require('../models/Product')
const Sale = require('../models/Sale')
const Purchase = require('../models/Purchase')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all products (paginated, searchable, filterable)
 * @route   GET /api/products
 * @access  Private
 */
const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    supplier,
    sort = '-createdAt',
    isActive
  } = req.query

  const query = {}

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ]
  }

  if (category) query.category = category
  if (supplier) query.supplier = supplier
  if (isActive !== undefined) query.isActive = isActive === 'true'

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  const total = await Product.countDocuments(query)
  const products = await Product.find(query)
    .populate('category', 'name color icon')
    .populate('supplier', 'name companyName email')
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    },
    'Products fetched successfully'
  )
}

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name color icon')
    .populate('supplier', 'name companyName email phone')
    .populate('createdBy', 'name email')

  if (!product) {
    return errorResponse(res, 'Product not found', 404)
  }

  return successResponse(res, { product }, 'Product fetched successfully')
}

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (admin/manager)
 */
const createProduct = async (req, res) => {
  const { name, sku, barcode, description, category, supplier, purchasePrice, sellingPrice, quantity, minStockLevel, maxStockLevel, expiryDate } = req.body

  // Check SKU uniqueness
  const skuUpper = sku ? sku.toUpperCase() : null
  if (skuUpper) {
    const existing = await Product.findOne({ sku: skuUpper })
    if (existing) {
      return errorResponse(res, 'A product with this SKU already exists', 409)
    }
  }

  const product = await Product.create({
    name,
    sku,
    barcode,
    description,
    category,
    supplier,
    purchasePrice,
    sellingPrice,
    quantity: quantity || 0,
    minStockLevel,
    maxStockLevel,
    expiryDate,
    createdBy: req.user._id
  })

  await product.populate([
    { path: 'category', select: 'name color icon' },
    { path: 'supplier', select: 'name companyName email' }
  ])

  // Emit real-time event
  if (req.io) {
    req.io.emit('productCreated', { product })
  }

  return successResponse(res, { product }, 'Product created successfully', 201)
}

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (admin/manager)
 */
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return errorResponse(res, 'Product not found', 404)
  }

  const { sku, ...updateData } = req.body

  // If SKU is being changed, check uniqueness
  if (sku && sku.toUpperCase() !== product.sku) {
    const existing = await Product.findOne({ sku: sku.toUpperCase(), _id: { $ne: product._id } })
    if (existing) {
      return errorResponse(res, 'A product with this SKU already exists', 409)
    }
    updateData.sku = sku
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('category', 'name color icon')
    .populate('supplier', 'name companyName email')

  // Emit real-time event
  if (req.io) {
    req.io.emit('productUpdated', { product: updatedProduct })
  }

  return successResponse(res, { product: updatedProduct }, 'Product updated successfully')
}

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (admin/manager)
 */
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return errorResponse(res, 'Product not found', 404)
  }

  // Check for associated sales
  const salesCount = await Sale.countDocuments({ 'items.product': product._id })
  if (salesCount > 0) {
    return errorResponse(
      res,
      `Cannot delete product. It is referenced in ${salesCount} sale(s).`,
      400
    )
  }

  // Check for associated purchases
  const purchasesCount = await Purchase.countDocuments({ 'items.product': product._id })
  if (purchasesCount > 0) {
    return errorResponse(
      res,
      `Cannot delete product. It is referenced in ${purchasesCount} purchase order(s).`,
      400
    )
  }

  await Product.findByIdAndDelete(req.params.id)

  return successResponse(res, null, 'Product deleted successfully')
}

/**
 * @desc    Get low stock products
 * @route   GET /api/products/low-stock
 * @access  Private
 */
const getLowStockProducts = async (req, res) => {
  const products = await Product.aggregate([
    {
      $match: {
        isActive: true,
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier'
      }
    },
    { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
    { $sort: { quantity: 1 } }
  ])

  return successResponse(res, { products }, 'Low stock products fetched successfully')
}

/**
 * @desc    Upload product image
 * @route   POST /api/products/:id/image
 * @access  Private (admin/manager)
 */
const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No image file uploaded', 400)
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return errorResponse(res, 'Product not found', 404)
  }

  product.image = `/uploads/${req.file.filename}`
  await product.save()

  return successResponse(
    res,
    { image: product.image },
    'Product image uploaded successfully'
  )
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  uploadProductImage
}
