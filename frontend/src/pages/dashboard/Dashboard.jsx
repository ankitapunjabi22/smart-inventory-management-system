 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle,
  Warehouse, ArrowUpRight, Plus, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchDashboardStats,
  fetchSalesChart,
  fetchPurchaseChart,
  fetchLowStockAlert,
  fetchRecentSales,
  fetchRecentPurchases
} from '../../redux/slices/dashboardSlice'
import StatsCard from '../../components/common/StatsCard'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const {
    stats,
    salesChart,
    purchaseChart,
    lowStockProducts,
    recentSales,
    recentPurchases,
    isLoading
  } = useAppSelector(state => state.dashboard)

  const loadAll = () => {
    dispatch(fetchDashboardStats())
    dispatch(fetchSalesChart())
    dispatch(fetchPurchaseChart())
    dispatch(fetchLowStockAlert())
    dispatch(fetchRecentSales())
    dispatch(fetchRecentPurchases())
  }

  useEffect(() => {
    loadAll()
  }, [dispatch])

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: _optionalChain([stats, 'optionalAccess', _ => _.totalProducts]) || 0,
      icon: Package,
      change: '+4%',
      trend: 'up' ,
      color: 'blue' 
    },
    {
      title: 'Total Inventory Value',
      value: `₹${(_optionalChain([stats, 'optionalAccess', _2 => _2.totalInventoryValue]) || 0).toLocaleString()}`,
      icon: Warehouse,
      change: '+12%',
      trend: 'up' ,
      color: 'indigo' 
    },
    {
      title: 'Total Sales Revenue',
      value: `₹${(_optionalChain([stats, 'optionalAccess', _3 => _3.totalSalesAmount]) || _optionalChain([stats, 'optionalAccess', _4 => _4.monthlyRevenue]) || 0).toLocaleString()}`,
      icon: TrendingUp,
      change: '+8%',
      trend: 'up' ,
      color: 'green' 
    },
    {
      title: 'Low Stock Alerts',
      value: (_optionalChain([stats, 'optionalAccess', _5 => _5.lowStockCount]) || 0) + (_optionalChain([stats, 'optionalAccess', _6 => _6.outOfStockCount]) || 0),
      icon: AlertTriangle,
      change: `${_optionalChain([stats, 'optionalAccess', _7 => _7.outOfStockCount]) || 0} out of stock`,
      trend: 'down' ,
      color: 'red' 
    }
  ]

  const lowStockColumns = [
    {
      header: 'Product',
      accessor: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.name}</p>
          <p className="text-xs text-slate-400">SKU: {p.sku}</p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (p) => _optionalChain([p, 'access', _8 => _8.category, 'optionalAccess', _9 => _9.name]) || 'General'
    },
    {
      header: 'Stock',
      accessor: (p) => (
        <span className={`font-bold ${p.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
          {p.quantity} {p.unit || 'units'}
        </span>
      )
    },
    {
      header: 'Min Level',
      accessor: (p) => p.minStockLevel
    },
    {
      header: 'Status',
      accessor: (p) => (
        <Badge variant={p.quantity === 0 ? 'danger' : 'warning'}>
          {p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
        </Badge>
      )
    }
  ]

  const recentSalesColumns = [
    {
      header: 'Invoice',
      accessor: (s) => s.invoiceNumber || _optionalChain([s, 'access', _10 => _10._id, 'optionalAccess', _11 => _11.substring, 'call', _12 => _12(0, 8)])
    },
    {
      header: 'Customer',
      accessor: (s) => _optionalChain([s, 'access', _13 => _13.customer, 'optionalAccess', _14 => _14.name]) || 'Walk-in Customer'
    },
    {
      header: 'Amount',
      accessor: (s) => `₹${(s.totalAmount || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: (s) => (
        <Badge variant={s.paymentStatus === 'paid' ? 'success' : 'warning'}>
          {s.paymentStatus || 'Paid'}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live monitoring, inventory analytics and sales summary</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadAll} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link to="/sales/add">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" /> New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatsCard key={idx} {...card} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Sales Overview</h2>
              <p className="text-xs text-slate-400">Monthly revenue trends</p>
            </div>
            <Link to="/sales" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="h-64">
            {salesChart && salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No sales records for the period
              </div>
            )}
          </div>
        </div>

        {/* Purchase Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Purchases Overview</h2>
              <p className="text-xs text-slate-400">Monthly expenditure on procurement</p>
            </div>
            <Link to="/purchases" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="h-64">
            {purchaseChart && purchaseChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Purchases']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="totalAmount" fill="#0f172a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No purchase records for the period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-slate-800">Low Stock Warnings</h2>
            </div>
            <Link to="/inventory" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Manage Stock
            </Link>
          </div>
          <Table
            columns={lowStockColumns}
            data={lowStockProducts || []}
            emptyMessage="All products have sufficient stock level."
          />
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-800">Recent Transactions</h2>
            </div>
            <Link to="/sales" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          <Table
            columns={recentSalesColumns}
            data={recentSales || []}
            emptyMessage="No recent sales recorded."
          />
        </div>
      </div>
    </div>
  )
}
