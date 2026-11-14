import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Package, DollarSign, Warehouse, Truck, Tag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchProduct } from '../../redux/slices/productSlice'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { currentProduct, isLoading } = useAppSelector(state => state.products)
  const { user } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (id) dispatch(fetchProduct(id))
  }, [dispatch, id])

  if (isLoading || !currentProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const categoryName = typeof currentProduct.category === 'object' && currentProduct.category !== null
    ? currentProduct.category.name : 'General'

  const supplierName = typeof currentProduct.supplier === 'object' && currentProduct.supplier !== null
    ? `${currentProduct.supplier.name} (${currentProduct.supplier.company || 'Direct'})` : 'Direct Vendor'

  const price = (currentProduct as any).sellingPrice ?? currentProduct.price ?? 0
  const cost = (currentProduct as any).purchasePrice ?? currentProduct.costPrice ?? 0
  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/products" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentProduct.name}</h1>
            <p className="text-sm text-slate-500">SKU: <span className="font-mono font-medium">{currentProduct.sku}</span></p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to={`/products/${currentProduct._id}/edit`}>
            <Button variant="primary" className="gap-2">
              <Edit className="w-4 h-4" /> Edit Product
            </Button>
          </Link>
        )}
      </div>

      {/* Main Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Quick Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
            {currentProduct.image ? (
              <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-16 h-16 text-slate-300" />
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Stock Status</span>
              {currentProduct.quantity === 0 ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : currentProduct.quantity <= currentProduct.minStockLevel ? (
                <Badge variant="warning">Low Stock</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Available Stock</span>
              <span className="font-bold text-slate-800 text-base">{currentProduct.quantity} {currentProduct.unit || 'units'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">Min Alert Level</span>
              <span className="font-medium text-slate-700">{currentProduct.minStockLevel}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-500">Max Capacity</span>
              <span className="font-medium text-slate-700">{currentProduct.maxStockLevel || 'Unlimited'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Metrics */}
        <div className="md:col-span-2 space-y-6">
          {/* Financial Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">Selling Price</p>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{price.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">Cost Price</p>
              <p className="text-xl font-bold text-slate-700 mt-1">₹{cost.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">Profit Margin</p>
              <p className="text-xl font-bold text-green-600 mt-1">{margin}%</p>
            </div>
          </div>

          {/* Details Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Specifications & Associations</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Category</p>
                <p className="font-medium text-slate-800 mt-0.5">{categoryName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Supplier</p>
                <p className="font-medium text-slate-800 mt-0.5">{supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Barcode / UPC</p>
                <p className="font-medium text-slate-800 mt-0.5">{(currentProduct as any).barcode || 'None'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Asset Value</p>
                <p className="font-bold text-blue-600 mt-0.5">₹{(currentProduct.quantity * cost).toLocaleString()}</p>
              </div>
            </div>

            {currentProduct.description && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Product Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{currentProduct.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
