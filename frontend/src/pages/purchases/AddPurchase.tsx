import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, ShoppingCart } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { createPurchase } from '../../redux/slices/purchaseSlice'
import { fetchSuppliers } from '../../redux/slices/supplierSlice'
import { fetchProducts } from '../../redux/slices/productSlice'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

interface LineItem {
  product: string
  quantity: number
  unitPrice: number
}

export default function AddPurchase() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { suppliers } = useAppSelector(state => state.suppliers)
  const { products } = useAppSelector(state => state.products)

  const [supplierId, setSupplierId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { product: '', quantity: 1, unitPrice: 0 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchSuppliers({}))
    dispatch(fetchProducts({ limit: 100 }))
  }, [dispatch])

  const handleProductChange = (index: number, pId: string) => {
    const selectedProd = products.find(p => p._id === pId)
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      product: pId,
      unitPrice: (selectedProd as any)?.purchasePrice ?? selectedProd?.costPrice ?? 0
    }
    setItems(newItems)
  }

  const handleQtyChange = (index: number, qty: number) => {
    const newItems = [...items]
    newItems[index].quantity = Math.max(1, qty)
    setItems(newItems)
  }

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items]
    newItems[index].unitPrice = Math.max(0, price)
    setItems(newItems)
  }

  const addRow = () => {
    setItems([...items, { product: '', quantity: 1, unitPrice: 0 }])
  }

  const removeRow = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }
    if (items.some(i => !i.product)) {
      toast.error('All line items must have a product selected')
      return
    }

    try {
      setIsSubmitting(true)
      await dispatch(createPurchase({
        supplier: supplierId,
        items: items as any,
        expectedDeliveryDate: expectedDate || undefined,
        notes: notes || undefined,
        totalAmount
      } as any)).unwrap()
      toast.success('Purchase order created successfully')
      navigate('/purchases')
    } catch (err: any) {
      toast.error(err || 'Failed to create purchase order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/purchases" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Purchase Order</h1>
          <p className="text-sm text-slate-500">Stock will increase only when this order is marked Received</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier / Vendor *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({(s as any).companyName || s.company || 'Vendor'})</option>
              ))}
            </select>
          </div>

          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Procurement Items</h3>
            <Button variant="secondary" size="sm" type="button" onClick={addRow} className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1 w-full">
                  <select
                    value={item.product}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit Price ₹"
                    value={item.unitPrice}
                    onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-28 text-right font-semibold text-slate-800 text-sm">
                  ₹{(item.quantity * item.unitPrice).toLocaleString()}
                </div>

                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={items.length <= 1}
                  className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal & Total */}
          <div className="flex justify-end p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Purchase Order Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Order Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, delivery instructions, invoice references..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link to="/purchases">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" isLoading={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" /> Save Purchase Order
          </Button>
        </div>
      </form>
    </div>
  )
}
