 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCircle, } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { createSale } from '../../redux/slices/saleSlice'
import { fetchProducts } from '../../redux/slices/productSlice'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'









export default function AddSale() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products } = useAppSelector(state => state.products)

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [items, setItems] = useState([
    { product: '', quantity: 1, unitPrice: 0, availableStock: 0 }
  ])

  useEffect(() => {
    dispatch(fetchProducts({ limit: 200 }))
  }, [dispatch])

  const handleProductChange = (index, pId) => {
    const prod = products.find(p => p._id === pId)
    const newItems = [...items]
    const price = _nullishCoalesce(_nullishCoalesce(_optionalChain([(prod ), 'optionalAccess', _2 => _2.sellingPrice]), () => ( _optionalChain([prod, 'optionalAccess', _3 => _3.price]))), () => ( 0))
    newItems[index] = {
      product: pId,
      quantity: 1,
      unitPrice: price,
      availableStock: _optionalChain([prod, 'optionalAccess', _4 => _4.quantity]) || 0
    }
    setItems(newItems)
  }

  const handleQtyChange = (index, qty) => {
    const newItems = [...items]
    const max = newItems[index].availableStock
    if (qty > max) {
      toast.error(`Only ${max} units available in inventory!`)
      return
    }
    newItems[index].quantity = Math.max(1, qty)
    setItems(newItems)
  }

  const addRow = () => {
    setItems([...items, { product: '', quantity: 1, unitPrice: 0, availableStock: 0 }])
  }

  const removeRow = (index) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalAmount = Math.max(0, subtotal - discount + tax)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (items.some(i => !i.product)) {
      toast.error('Please select a product for all items')
      return
    }

    for (const item of items) {
      if (item.quantity > item.availableStock) {
        toast.error(`Insufficient stock for selected items`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      const res = await dispatch(createSale({
        customer,
        items: items.map(i => ({
          product: i.product,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.quantity * i.unitPrice
        })) ,
        subtotal,
        discount,
        tax,
        totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        notes
      } )).unwrap()

      toast.success('Sale successfully processed! Stock updated.')
      const saleId = _optionalChain([res, 'access', _5 => _5.data, 'optionalAccess', _6 => _6._id]) || _optionalChain([res, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.sale, 'optionalAccess', _9 => _9._id]) || res._id
      if (saleId) {
        navigate(`/sales/${saleId}`)
      } else {
        navigate('/sales')
      }
    } catch (err) {
      toast.error(err || 'Failed to process sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/sales" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Sale Order</h1>
          <p className="text-sm text-slate-500">Warehouse stock will automatically deduct upon completion</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Customer Details (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Customer Name"
              placeholder="e.g. Rahul Sharma"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 9876543210"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. customer@gmail.com"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>
        </div>

        {/* Product Items Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Sale Line Items</h2>
            <Button variant="secondary" size="sm" type="button" onClick={addRow} className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Product
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
                    <option value="">Select Item to Sell...</option>
                    {(Array.isArray(products) ? products : []).map(p => (
                      <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                        {p.name} — (In Stock: {p.quantity}) — ₹{_nullishCoalesce(_nullishCoalesce((p ).sellingPrice, () => ( p.price)), () => ( 0))}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    min="1"
                    max={item.availableStock || 99999}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:outline-none"
                  />
                  {item.availableStock > 0 && (
                    <p className="text-[10px] text-center text-slate-400 mt-0.5">Avail: {item.availableStock}</p>
                  )}
                </div>

                <div className="w-full sm:w-28 text-right font-semibold text-slate-700 text-sm">
                  ₹{item.unitPrice.toLocaleString()}
                </div>

                <div className="w-full sm:w-32 text-right font-bold text-slate-900 text-sm">
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

          {/* Pricing Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'card', 'upi', 'bank_transfer'] ).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${paymentMethod === method ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Invoice Notes"
                placeholder="Discounts given, terms, order remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-right text-sm"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>GST / Tax (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-right text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-base">Net Payable</span>
                <span className="text-2xl font-black text-blue-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/sales">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" isLoading={isSubmitting} className="gap-2">
            <CheckCircle className="w-4 h-4" /> Complete Sale & Print Bill
          </Button>
        </div>
      </form>
    </div>
  )
}
