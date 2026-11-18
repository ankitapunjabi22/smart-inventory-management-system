 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Sliders,
  Search,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProducts } from '../../redux/slices/productSlice'
import {
  stockIn,
  stockOut,
  adjustment,
  fetchTransactions
} from '../../redux/slices/inventorySlice'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'


export default function Inventory() {
  const dispatch = useAppDispatch()
  const { products } = useAppSelector(state => state.products)
  const { transactions, pagination, isLoading } = useAppSelector(state => state.inventory)

  const [activeTab, setActiveTab] = useState('overview')
  const [modalType, setModalType] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [quantityInput, setQuantityInput] = useState(1)
  const [reasonInput, setReasonInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }))
    dispatch(fetchTransactions({ page }))
  }, [dispatch, page])

  const openActionModal = (product, type) => {
    setSelectedProduct(product)
    setModalType(type)
    setQuantityInput(type === 'adjust' ? product.quantity : 1)
    setReasonInput('')
    setNotesInput('')
  }

  const handleActionSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      if (modalType === 'in') {
        await dispatch(stockIn({
          product: selectedProduct._id,
          quantity: Number(quantityInput),
          reason: reasonInput || 'Restocking',
          reference: notesInput
        })).unwrap()
        toast.success(`Successfully added ${quantityInput} units to ${selectedProduct.name}`)
      } else if (modalType === 'out') {
        await dispatch(stockOut({
          product: selectedProduct._id,
          quantity: Number(quantityInput),
          reason: reasonInput || 'Dispatched for usage',
          reference: notesInput
        })).unwrap()
        toast.success(`Dispatched ${quantityInput} units from ${selectedProduct.name}`)
      } else if (modalType === 'adjust') {
        await dispatch(adjustment({
          product: selectedProduct._id,
          quantity: Number(quantityInput),
          reason: reasonInput || 'Physical count adjustment'
        })).unwrap()
        toast.success(`Adjusted ${selectedProduct.name} stock to ${quantityInput}`)
      }

      setModalType(null)
      dispatch(fetchProducts({ limit: 100 }))
      dispatch(fetchTransactions({ page }))
    } catch (err) {
      toast.error(err || 'Operation failed')
    }
  }

  const safeProducts = Array.isArray(products) ? products : []
  const filteredProducts = safeProducts.filter(p =>
    _optionalChain([p, 'optionalAccess', _ => _.name, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'access', _4 => _4.includes, 'call', _5 => _5(search.toLowerCase())]) ||
    _optionalChain([p, 'optionalAccess', _6 => _6.sku, 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8(), 'access', _9 => _9.includes, 'call', _10 => _10(search.toLowerCase())])
  )

  const transactionColumns = [
    {
      header: 'Date & Time',
      accessor: (t) => new Date(t.createdAt).toLocaleString()
    },
    {
      header: 'Product',
      accessor: (t) => (
        <div>
          <p className="font-semibold text-slate-800">{_optionalChain([t, 'access', _11 => _11.product, 'optionalAccess', _12 => _12.name]) || 'General Product'}</p>
          <p className="text-xs text-slate-400">SKU: {_optionalChain([t, 'access', _13 => _13.product, 'optionalAccess', _14 => _14.sku]) || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Action Type',
      accessor: (t) => {
        const type = t.transactionType || t.type
        if (type === 'stock_in') return <Badge variant="success">Stock In (+)</Badge>
        if (type === 'stock_out') return <Badge variant="danger">Stock Out (-)</Badge>
        if (type === 'sale') return <Badge variant="warning">Sale Dispatched</Badge>
        if (type === 'purchase') return <Badge variant="info">Procurement Received</Badge>
        return <Badge variant="default">Adjustment</Badge>
      }
    },
    {
      header: 'Movement',
      accessor: (t) => (
        <span className="font-semibold text-slate-700">
          {t.previousQuantity} → <span className="text-blue-600 font-bold">{t.newQuantity}</span>
          <span className="text-xs text-slate-400 ml-1">({t.quantity > 0 ? `Δ ${t.quantity}` : ''})</span>
        </span>
      )
    },
    {
      header: 'Reason / Ref',
      accessor: (t) => (
        <div>
          <p className="text-xs font-medium text-slate-700">{t.reason || 'General update'}</p>
          {t.notes && <p className="text-[11px] text-slate-400">{t.notes}</p>}
        </div>
      )
    },
    {
      header: 'Operator',
      accessor: (t) => _optionalChain([t, 'access', _15 => _15.createdBy, 'optionalAccess', _16 => _16.name]) || _optionalChain([(t ), 'access', _17 => _17.performedBy, 'optionalAccess', _18 => _18.name]) || 'System'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Control & Stock Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time Stock In, Stock Out, Adjustments and Audit Log</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Stock Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Transaction History
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Product cards grid for fast stock manipulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(p => (
              <div key={p._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {p.sku}</p>
                    </div>
                    {p.quantity === 0 ? (
                      <Badge variant="danger">Out</Badge>
                    ) : p.quantity <= p.minStockLevel ? (
                      <Badge variant="warning">Low</Badge>
                    ) : (
                      <Badge variant="success">Good</Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">{p.quantity}</span>
                    <span className="text-xs text-slate-500">{p.unit || 'units'} in warehouse</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Min threshold: {p.minStockLevel}</p>
                </div>

                {/* Fast Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openActionModal(p, 'in')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span className="text-xs font-semibold mt-1">Stock In</span>
                  </button>

                  <button
                    onClick={() => openActionModal(p, 'out')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-xs font-semibold mt-1">Stock Out</span>
                  </button>

                  <button
                    onClick={() => openActionModal(p, 'adjust')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Sliders className="w-4 h-4" />
                    <span className="text-xs font-semibold mt-1">Adjust</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table
            columns={transactionColumns}
            data={transactions}
            isLoading={isLoading}
            emptyMessage="No inventory transaction logs recorded."
          />
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Operation Modal */}
      <Modal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        title={
          modalType === 'in' ? `Stock In: ${_optionalChain([selectedProduct, 'optionalAccess', _19 => _19.name])}` :
          modalType === 'out' ? `Stock Out: ${_optionalChain([selectedProduct, 'optionalAccess', _20 => _20.name])}` :
          `Adjust Quantity: ${_optionalChain([selectedProduct, 'optionalAccess', _21 => _21.name])}`
        }
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-500">Current Stock</span>
            <span className="font-bold text-slate-800">{_optionalChain([selectedProduct, 'optionalAccess', _22 => _22.quantity])} {_optionalChain([selectedProduct, 'optionalAccess', _23 => _23.unit]) || 'units'}</span>
          </div>

          <Input
            label={modalType === 'adjust' ? 'New Exact Quantity *' : 'Quantity Units *'}
            type="number"
            min={modalType === 'adjust' ? 0 : 1}
            value={quantityInput}
            onChange={(e) => setQuantityInput(Number(e.target.value))}
            required
          />

          <Input
            label="Reason / Purpose"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder={
              modalType === 'in' ? 'e.g. Received shipment, Returned item' :
              modalType === 'out' ? 'e.g. Sales dispatch, Damage disposal' :
              'e.g. Annual physical count check'
            }
          />

          <Input
            label="Reference ID / Notes"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="e.g. PO-8923 or Dispatch Slip #12"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant={modalType === 'out' ? 'danger' : 'primary'}
              type="submit"
            >
              Confirm {modalType === 'in' ? 'Stock In' : modalType === 'out' ? 'Stock Out' : 'Adjustment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
