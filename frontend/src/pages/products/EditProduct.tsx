import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProduct, updateProduct } from '../../redux/slices/productSlice'
import { fetchCategories } from '../../redux/slices/categorySlice'
import { fetchSuppliers } from '../../redux/slices/supplierSlice'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { currentProduct, isLoading } = useAppSelector(state => state.products)
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
    if (id) dispatch(fetchProduct(id))
  }, [dispatch, id])

  useEffect(() => {
    if (currentProduct) {
      setForm({
        name: currentProduct.name || '',
        sku: currentProduct.sku || '',
        barcode: (currentProduct as any).barcode || '',
        category: typeof currentProduct.category === 'object' && currentProduct.category !== null ? currentProduct.category._id : (currentProduct.category as string) || '',
        supplier: typeof currentProduct.supplier === 'object' && currentProduct.supplier !== null ? currentProduct.supplier._id : (currentProduct.supplier as string) || '',
        purchasePrice: (currentProduct as any).purchasePrice ?? currentProduct.costPrice ?? 0,
        sellingPrice: (currentProduct as any).sellingPrice ?? currentProduct.price ?? 0,
        quantity: currentProduct.quantity || 0,
        minStockLevel: currentProduct.minStockLevel || 5,
        maxStockLevel: currentProduct.maxStockLevel || 100,
        unit: currentProduct.unit || 'pcs',
        description: currentProduct.description || ''
      })
    }
  }, [currentProduct])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      setIsSubmitting(true)
      await dispatch(updateProduct({ id, data: form })).unwrap()
      toast.success('Product updated successfully')
      navigate('/products')
    } catch (err: any) {
      toast.error(err || 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !currentProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-sm text-slate-500">Update specifications and stock configuration</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="SKU *"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
          />

          <Input
            label="Barcode"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
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
              {categories.map(c => (
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
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.company || 'Direct'})</option>
              ))}
            </select>
          </div>

          <Input
            label="Unit"
            name="unit"
            value={form.unit}
            onChange={handleChange}
          />

          <Input
            label="Purchase Price (₹) *"
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
            label="Available Quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Stock"
              name="minStockLevel"
              type="number"
              min="0"
              value={form.minStockLevel}
              onChange={handleChange}
            />
            <Input
              label="Max Stock"
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
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link to="/products">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" isLoading={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Update Product
          </Button>
        </div>
      </form>
    </div>
  )
}
