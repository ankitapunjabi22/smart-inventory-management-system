import { useEffect, useState } from 'react'
import { BarChart3, Download, Calendar, Filter, TrendingUp, ShoppingCart, Warehouse } from 'lucide-react'
import api from '../../services/api'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function Reports() {
  const [activeReport, setActiveReport] = useState<'inventory' | 'sales' | 'purchases'>('inventory')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const fetchReport = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await api.get(`/reports/${activeReport}?${params.toString()}`)
      setData(res.data?.data || null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch report data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeReport])

  const exportCSV = () => {
    if (!data) return
    let csvContent = 'data:text/csv;charset=utf-8,'

    if (activeReport === 'inventory') {
      csvContent += 'Name,SKU,Category,Quantity,PurchasePrice,SellingPrice,TotalValue\n'
      data.products?.forEach((p: any) => {
        csvContent += `"${p.name}","${p.sku}","${p.category?.name || 'General'}",${p.quantity},${p.purchasePrice || 0},${p.sellingPrice || 0},${(p.quantity * (p.purchasePrice || 0))}\n`
      })
    } else if (activeReport === 'sales') {
      csvContent += 'InvoiceID,Customer,PaymentMethod,TotalAmount,Date\n'
      data.sales?.forEach((s: any) => {
        csvContent += `"${s.saleId || s._id}","${s.customer?.name || 'Walk-in'}","${s.paymentMethod}",${s.totalAmount},"${new Date(s.createdAt).toLocaleDateString()}"\n`
      })
    } else if (activeReport === 'purchases') {
      csvContent += 'OrderID,Supplier,TotalAmount,Status,Date\n'
      data.purchases?.forEach((p: any) => {
        csvContent += `"${p.purchaseOrderId || p._id}","${p.supplier?.name || 'Vendor'}",${p.totalAmount},"${p.orderStatus}","${new Date(p.createdAt).toLocaleDateString()}"\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported to CSV')
  }

  const inventoryColumns = [
    {
      header: 'Product',
      accessor: (p: any) => (
        <div>
          <p className="font-semibold text-slate-800">{p.name}</p>
          <p className="text-xs text-slate-400">SKU: {p.sku}</p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (p: any) => p.category?.name || 'General'
    },
    {
      header: 'Stock',
      accessor: (p: any) => `${p.quantity} units`
    },
    {
      header: 'Cost Price',
      accessor: (p: any) => `₹${(p.purchasePrice || 0).toLocaleString()}`
    },
    {
      header: 'Selling Price',
      accessor: (p: any) => `₹${(p.sellingPrice || 0).toLocaleString()}`
    },
    {
      header: 'Valuation',
      accessor: (p: any) => (
        <span className="font-bold text-blue-600">
          ₹{((p.quantity || 0) * (p.purchasePrice || 0)).toLocaleString()}
        </span>
      )
    }
  ]

  const salesColumns = [
    {
      header: 'Date',
      accessor: (s: any) => new Date(s.createdAt).toLocaleDateString()
    },
    {
      header: 'Invoice ID',
      accessor: (s: any) => s.saleId || s._id?.substring(0, 8)
    },
    {
      header: 'Customer',
      accessor: (s: any) => s.customer?.name || 'Walk-in Customer'
    },
    {
      header: 'Payment',
      accessor: (s: any) => <span className="capitalize">{s.paymentMethod}</span>
    },
    {
      header: 'Net Amount',
      accessor: (s: any) => <span className="font-bold text-slate-900">₹{(s.totalAmount || 0).toLocaleString()}</span>
    }
  ]

  const purchaseColumns = [
    {
      header: 'Date',
      accessor: (p: any) => new Date(p.createdAt).toLocaleDateString()
    },
    {
      header: 'PO ID',
      accessor: (p: any) => p.purchaseOrderId || p._id?.substring(0, 8)
    },
    {
      header: 'Supplier',
      accessor: (p: any) => p.supplier?.name || 'Vendor'
    },
    {
      header: 'Status',
      accessor: (p: any) => (
        <Badge variant={p.orderStatus === 'received' ? 'success' : 'warning'}>
          {p.orderStatus}
        </Badge>
      )
    },
    {
      header: 'Total Cost',
      accessor: (p: any) => <span className="font-bold text-slate-900">₹{(p.totalAmount || 0).toLocaleString()}</span>
    }
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytical Reports & Audits</h1>
          <p className="text-sm text-slate-500 mt-1">Export valuation sheets, sales logs and procurement ledger</p>
        </div>
        <Button variant="secondary" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveReport('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeReport === 'inventory' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Warehouse className="w-4 h-4" /> Inventory Valuation
        </button>

        <button
          onClick={() => setActiveReport('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeReport === 'sales' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <TrendingUp className="w-4 h-4" /> Sales Revenue Ledger
        </button>

        <button
          onClick={() => setActiveReport('purchases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeReport === 'purchases' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Procurement
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" /> Date Range:
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        />
        <Button variant="primary" size="sm" onClick={fetchReport}>Apply Filter</Button>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeReport === 'inventory' && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Catalog Items</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalProducts}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Warehouse Value</p>
                <p className="text-xl font-bold text-blue-600 mt-1">₹{data.summary.totalInventoryValue?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Low Stock SKUs</p>
                <p className="text-xl font-bold text-amber-600 mt-1">{data.summary.lowStockProducts}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Out of Stock SKUs</p>
                <p className="text-xl font-bold text-red-600 mt-1">{data.summary.outOfStockProducts}</p>
              </div>
            </>
          )}

          {activeReport === 'sales' && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Orders Closed</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalSales}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Sales Turnover</p>
                <p className="text-xl font-bold text-green-600 mt-1">₹{data.summary.totalRevenue?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Line Items Sold</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{data.summary.totalItems}</p>
              </div>
            </>
          )}

          {activeReport === 'purchases' && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Purchase Orders</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{data.summary.totalPurchases}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400">Total Procurement Cost</p>
                <p className="text-xl font-bold text-slate-900 mt-1">₹{data.summary.totalSpent?.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={
              activeReport === 'inventory' ? inventoryColumns :
              activeReport === 'sales' ? salesColumns :
              purchaseColumns
            }
            data={
              activeReport === 'inventory' ? data?.products || [] :
              activeReport === 'sales' ? data?.sales || [] :
              data?.purchases || []
            }
            emptyMessage="No records found for the selected parameters."
          />
        )}
      </div>
    </div>
  )
}
