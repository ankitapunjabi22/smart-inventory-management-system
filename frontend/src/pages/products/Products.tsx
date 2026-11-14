import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Trash2, Edit, Eye, AlertCircle, Download } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice'
import { fetchCategories } from '../../redux/slices/categorySlice'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import type { Product } from '../../types'

export default function Products() {
  const dispatch = useAppDispatch()
  const { products, isLoading, pagination } = useAppSelector(state => state.products)
  const { categories } = useAppSelector(state => state.categories)
  const { user } = useAppSelector(state => state.auth)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = () => {
    const params: Record<string, any> = { page, limit: 10 }
    if (search) params.search = search
    if (selectedCategory) params.category = selectedCategory
    if (stockStatus) params.status = stockStatus
    dispatch(fetchProducts(params))
  }

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    loadData()
  }, [dispatch, page, selectedCategory, stockStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await dispatch(deleteProduct(deleteId)).unwrap()
      toast.success('Product removed successfully')
      setDeleteId(null)
      loadData()
    } catch (err: any) {
      toast.error(err || 'Failed to delete product')
    }
  }

  const columns = [
    {
      header: 'Product Info',
      accessor: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden flex-shrink-0">
            {p.image ? (
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              p.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <Link to={`/products/${p._id}`} className="font-semibold text-slate-800 hover:text-blue-600">
              {p.name}
            </Link>
            <p className="text-xs text-slate-400">SKU: {p.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: (p: Product) => (typeof p.category === 'object' && p.category !== null ? p.category.name : 'General')
    },
    {
      header: 'Stock',
      accessor: (p: Product) => (
        <div>
          <span className={`font-semibold ${p.quantity === 0 ? 'text-red-600' : p.quantity <= p.minStockLevel ? 'text-amber-600' : 'text-slate-700'}`}>
            {p.quantity} {p.unit || 'units'}
          </span>
          <p className="text-[11px] text-slate-400">Min: {p.minStockLevel}</p>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: (p: Product) => (
        <div>
          <span className="font-semibold text-slate-800">₹{(p.price || (p as any).sellingPrice || 0).toLocaleString()}</span>
          {p.costPrice && <p className="text-[11px] text-slate-400">Cost: ₹{p.costPrice.toLocaleString()}</p>}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (p: Product) => {
        if (p.quantity === 0) return <Badge variant="danger">Out of Stock</Badge>
        if (p.quantity <= p.minStockLevel) return <Badge variant="warning">Low Stock</Badge>
        return <Badge variant="success">In Stock</Badge>
      }
    },
    {
      header: 'Actions',
      accessor: (p: Product) => (
        <div className="flex items-center gap-2">
          <Link to={`/products/${p._id}`} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg">
            <Eye className="w-4 h-4" />
          </Link>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link to={`/products/${p._id}/edit`} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg">
              <Edit className="w-4 h-4" />
            </Link>
          )}
          {user?.role === 'admin' && (
            <button
              onClick={() => setDeleteId(p._id)}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage catalog items, pricing and stock alerts</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to="/products/add">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1) }}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={products}
          isLoading={isLoading}
          emptyMessage="No products match the selected filters."
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Are you sure you want to delete this product? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Product</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
