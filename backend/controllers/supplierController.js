const Supplier = require('../models/Supplier')
const Product = require('../models/Product')
const { successResponse, errorResponse } = require('../utils/apiResponse')

/**
 * @desc    Get all suppliers (with optional search)
 * @route   GET /api/suppliers
 * @access  Private
 */
const getSuppliers = async (req, res) => {
  const { search, page = 1, limit = 20, isActive } = req.query

  const query = {}

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true'
  }

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)
  const skip = (pageNum - 1) * limitNum

  const total = await Supplier.countDocuments(query)
  const suppliers = await Supplier.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)

  return successResponse(
    res,
    {
      suppliers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    },
    'Suppliers fetched successfully'
  )
}

/**
 * @desc    Get single supplier
 * @route   GET /api/suppliers/:id
 * @access  Private
 */
const getSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id).populate('createdBy', 'name email')
  if (!supplier) {
    return errorResponse(res, 'Supplier not found', 404)
  }
  return successResponse(res, { supplier }, 'Supplier fetched successfully')
}

/**
 * @desc    Create supplier
 * @route   POST /api/suppliers
 * @access  Private (admin/manager)
 */
const createSupplier = async (req, res) => {
  const { name, companyName, email, phone, address, gstNumber } = req.body

  if (email) {
    const existing = await Supplier.findOne({ email })
    if (existing) {
      return errorResponse(res, 'A supplier with this email already exists', 409)
    }
  }

  const supplier = await Supplier.create({
    name,
    companyName,
    email,
    phone,
    address,
    gstNumber,
    createdBy: req.user._id
  })

  return successResponse(res, { supplier }, 'Supplier created successfully', 201)
}

/**
 * @desc    Update supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private (admin/manager)
 */
const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
  if (!supplier) {
    return errorResponse(res, 'Supplier not found', 404)
  }

  const { name, companyName, email, phone, address, gstNumber, isActive } = req.body

  // Check email uniqueness if email is being changed
  if (email && email !== supplier.email) {
    const existing = await Supplier.findOne({ email, _id: { $ne: supplier._id } })
    if (existing) {
      return errorResponse(res, 'A supplier with this email already exists', 409)
    }
    supplier.email = email
  }

  if (name !== undefined) supplier.name = name
  if (companyName !== undefined) supplier.companyName = companyName
  if (phone !== undefined) supplier.phone = phone
  if (address !== undefined) supplier.address = { ...supplier.address.toObject(), ...address }
  if (gstNumber !== undefined) supplier.gstNumber = gstNumber
  if (isActive !== undefined) supplier.isActive = isActive

  await supplier.save()

  return successResponse(res, { supplier }, 'Supplier updated successfully')
}

/**
 * @desc    Delete supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private (admin/manager)
 */
const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
  if (!supplier) {
    return errorResponse(res, 'Supplier not found', 404)
  }

  const productCount = await Product.countDocuments({ supplier: supplier._id })
  if (productCount > 0) {
    return errorResponse(
      res,
      `Cannot delete supplier. It is associated with ${productCount} product(s). Reassign products first.`,
      400
    )
  }

  await Supplier.findByIdAndDelete(req.params.id)

  return successResponse(res, null, 'Supplier deleted successfully')
}

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier }
