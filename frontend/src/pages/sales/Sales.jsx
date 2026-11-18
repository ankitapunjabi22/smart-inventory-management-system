 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchSales } from '../../redux/slices/saleSlice'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'


export default function Sales() {
  const dispatch = useAppDispatch()
  const { sales, isLoading, pagination } = useAppSelector(state => state.sales)

  const [paymentFilter, setPaymentFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadData = () => {
    const params = { page, limit: 10 }
    if (paymentFilter) params.paymentStatus = paymentFilter
    dispatch(fetchSales(params))
  }

  useEffect(() => {
    loadData()
  }, [dispatch, page, paymentFilter])

  const columns = [
    {
      header: 'Invoice / Order ID',
      accessor: (s) => (
        <div>
          <Link to={`/sales/${s._id}`} className="font-semibold text-slate-800 hover:text-blue-600 font-mono">
            {s.saleId || s.invoiceNumber || _optionalChain([s, 'access', _ => _._id, 'optionalAccess', _2 => _2.substring, 'call', _3 => _3(0, 8)])}
          </Link>
          <p className="text-xs text-slate-400">
            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (s) => (
        <div>
          <p className="font-medium text-slate-800">{_optionalChain([s, 'access', _4 => _4.customer, 'optionalAccess', _5 => _5.name]) || 'Walk-in Customer'}</p>
          {_optionalChain([s, 'access', _6 => _6.customer, 'optionalAccess', _7 => _7.phone]) && <p className="text-xs text-slate-400">{s.customer.phone}</p>}
        </div>
      )
    },
    {
      header: 'Items',
      accessor: (s) => `${_optionalChain([s, 'access', _8 => _8.items, 'optionalAccess', _9 => _9.length]) || 0} line items`
    },
    {
      header: 'Payment Method',
      accessor: (s) => (
        <span className="capitalize text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
          {s.paymentMethod || 'Cash'}
        </span>
      )
    },
    {
      header: 'Total Revenue',
      accessor: (s) => (
        <span className="font-bold text-slate-900 text-sm">₹{(s.totalAmount || 0).toLocaleString()}</span>
      )
    },
    {
      header: 'Payment Status',
      accessor: (s) => (
        <Badge variant={s.paymentStatus === 'paid' ? 'success' : 'warning'}>
          {s.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: (s) => (
        <Link
          to={`/sales/${s._id}`}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1 text-xs"
        >
          <Eye className="w-4 h-4" /> Invoice
        </Link>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales & Billing Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Point of Sale, invoice generation and payment receipts</p>
        </div>
        <Link to="/sales/add">
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" /> Create New Sale
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1) }}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={sales}
          isLoading={isLoading}
          emptyMessage="No sales recorded yet."
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
