import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { createProduct } from '../../redux/slices/productSlice'
import { fetchCategories } from '../../redux/slices/categorySlice'
import { fetchSuppliers } from '../../redux/slices/supplierSlice'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { categories } = useAppSelector(state => state.categories)
  const { suppliers } = useAppSelector(state => state.suppliers)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    supplier: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStockLevel: 5,
    maxStockLevel: 100,
    unit: 'pcs',
    description: ''
  })

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchSuppliers())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.sku) {
      toast.error('Product Name and SKU are required')
      return
    }
    if (form.sellingPrice < 0 || form.purchasePrice < 0) {
      toast.error('Prices cannot be negative')
      return
    }

    try {
      setIsSubmitting(true)
      await dispatch(createProduct(form)).unwrap()
      toast.success('Product created successfully')
      navigate('/products')
    } catch (err) {
      toast.error(err || 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-sm text-slate-500">Fill in product information and inventory thresholds</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Ergonomic Mouse"
            required
          />

          <Input
            label="SKU (Stock Keeping Unit) *"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="e.g. ELEC-MOU-001"
            required
          />

          <Input
            label="Barcode / UPC"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            placeholder="e.g. 890123456789"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {(Array.isArray(categories) ? categories : []).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
            <select
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {(Array.isArray(suppliers) ? suppliers : []).map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.company || 'Direct'})</option>
              ))}
            </select>
          </div>

          <Input
            label="Measurement Unit"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="e.g. pcs, box, kg"
          />

          <Input
            label="Cost / Purchase Price (₹) *"
            name="purchasePrice"
            type="number"
            min="0"
            step="0.01"
            value={form.purchasePrice}
            onChange={handleChange}
            required
          />

          <Input
            label="Selling Price (₹) *"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.sellingPrice}
            onChange={handleChange}
            required
          />

          <Input
            label="Initial Stock Quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Stock (Alert)"
              name="minStockLevel"
              type="number"
              min="0"
              value={form.minStockLevel}
              onChange={handleChange}
            />
            <Input
              label="Max Stock Level"
              name="maxStockLevel"
              type="number"
              min="0"
              value={form.maxStockLevel}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed product specifications or notes..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link to="/products">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" isLoading={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Save Product
          </Button>
        </div>
      </form>
    </div>
  )
}
