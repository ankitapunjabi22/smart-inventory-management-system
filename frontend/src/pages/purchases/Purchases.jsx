 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, CheckCircle2, } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchPurchases, receivePurchase, } from '../../redux/slices/purchaseSlice'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'


export default function Purchases() {
  const dispatch = useAppDispatch()
  const { purchases, isLoading, pagination } = useAppSelector(state => state.purchases)
  const { user } = useAppSelector(state => state.auth)

  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadData = () => {
    const params = { page, limit: 10 }
    if (statusFilter) params.orderStatus = statusFilter
    dispatch(fetchPurchases(params))
  }

  useEffect(() => {
    loadData()
  }, [dispatch, page, statusFilter])

  const handleQuickReceive = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Mark this purchase order as Received? Stock will be updated in warehouse.')) return
    try {
      await dispatch(receivePurchase({ id })).unwrap()
      toast.success('Purchase received and warehouse stock updated')
      loadData()
    } catch (err) {
      toast.error(err || 'Failed to receive purchase')
    }
  }

  const columns = [
    {
      header: 'Order Reference',
      accessor: (p) => (
        <div>
          <Link to={`/purchases/${p._id}`} className="font-semibold text-slate-800 hover:text-blue-600">
            {p.purchaseOrderId || p.orderNumber || _optionalChain([p, 'access', _ => _._id, 'optionalAccess', _2 => _2.substring, 'call', _3 => _3(0, 8)])}
          </Link>
          <p className="text-xs text-slate-400">
            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      )
    },
    {
      header: 'Supplier',
      accessor: (p) => _optionalChain([p, 'access', _4 => _4.supplier, 'optionalAccess', _5 => _5.name]) || _optionalChain([p, 'access', _6 => _6.supplier, 'optionalAccess', _7 => _7.companyName]) || 'Vendor'
    },
    {
      header: 'Items Count',
      accessor: (p) => `${_optionalChain([p, 'access', _8 => _8.items, 'optionalAccess', _9 => _9.length]) || 0} items`
    },
    {
      header: 'Total Cost',
      accessor: (p) => (
        <span className="font-bold text-slate-900">₹{(p.totalAmount || 0).toLocaleString()}</span>
      )
    },
    {
      header: 'Order Status',
      accessor: (p) => {
        const s = p.orderStatus || p.status || 'pending'
        if (s === 'received') return <Badge variant="success">Received (In Stock)</Badge>
        if (s === 'ordered') return <Badge variant="info">Ordered / In Transit</Badge>
        if (s === 'cancelled') return <Badge variant="danger">Cancelled</Badge>
        return <Badge variant="warning">Pending</Badge>
      }
    },
    {
      header: 'Actions',
      accessor: (p) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/purchases/${p._id}`}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {(_optionalChain([user, 'optionalAccess', _10 => _10.role]) === 'admin' || _optionalChain([user, 'optionalAccess', _11 => _11.role]) === 'manager') && (p.orderStatus !== 'received' && p.orderStatus !== 'cancelled') && (
            <button
              onClick={(e) => handleQuickReceive(p._id, e)}
              title="Receive Goods"
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 text-xs font-medium"
            >
              <CheckCircle2 className="w-4 h-4" /> Receive
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor procurement and inventory restocking</p>
        </div>
        {(_optionalChain([user, 'optionalAccess', _12 => _12.role]) === 'admin' || _optionalChain([user, 'optionalAccess', _13 => _13.role]) === 'manager') && (
          <Link to="/purchases/add">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" /> Create Purchase Order
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={purchases}
          isLoading={isLoading}
          emptyMessage="No purchase orders created yet."
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
    </div>
  )
}
