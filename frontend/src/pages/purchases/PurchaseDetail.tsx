import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, ShoppingCart, Truck, Calendar, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchPurchase, receivePurchase, cancelPurchase } from '../../redux/slices/purchaseSlice'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function PurchaseDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { currentPurchase, isLoading } = useAppSelector(state => state.purchases)
  const { user } = useAppSelector(state => state.auth)

  useEffect(() => {
    if (id) dispatch(fetchPurchase(id))
  }, [dispatch, id])

  const handleReceive = async () => {
    if (!id) return
    if (!window.confirm('Receive this order? Product inventory counts will automatically increment.')) return
    try {
      await dispatch(receivePurchase({ id })).unwrap()
      toast.success('Order marked received and warehouse inventory updated!')
      dispatch(fetchPurchase(id))
    } catch (err: any) {
      toast.error(err || 'Failed to receive order')
    }
  }

  const handleCancel = async () => {
    if (!id) return
    if (!window.confirm('Are you sure you want to cancel this purchase order?')) return
    try {
      await dispatch(cancelPurchase(id)).unwrap()
      toast.success('Purchase order cancelled')
      dispatch(fetchPurchase(id))
    } catch (err: any) {
      toast.error(err || 'Failed to cancel order')
    }
  }

  if (isLoading || !currentPurchase) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const p: any = currentPurchase
  const orderStatus = p.orderStatus || p.status || 'pending'
  const isReceived = orderStatus === 'received'
  const isCancelled = orderStatus === 'cancelled'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/purchases" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {p.purchaseOrderId || p.orderNumber || p._id?.substring(0, 8)}
              </h1>
              {isReceived ? (
                <Badge variant="success">Received (Stock Added)</Badge>
              ) : isCancelled ? (
                <Badge variant="danger">Cancelled</Badge>
              ) : (
                <Badge variant="warning">Pending Receiving</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Created on {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isReceived && !isCancelled && (user?.role === 'admin' || user?.role === 'manager') && (
            <>
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Cancel Order
              </Button>
              <Button variant="primary" size="sm" onClick={handleReceive} className="gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Mark as Received
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Truck className="w-4 h-4 text-blue-600" /> Supplier Details
          </div>
          <p className="font-bold text-slate-800 text-base">{p.supplier?.name || 'Direct Supplier'}</p>
          <p className="text-xs text-slate-500">{p.supplier?.companyName || p.supplier?.company || 'Vendor'}</p>
          <p className="text-xs text-slate-500">{p.supplier?.email}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Calendar className="w-4 h-4 text-blue-600" /> Delivery Status
          </div>
          <p className="text-sm text-slate-600">
            Expected: <span className="font-semibold text-slate-800">{p.expectedDeliveryDate ? new Date(p.expectedDeliveryDate).toLocaleDateString() : 'Immediate'}</span>
          </p>
          <p className="text-sm text-slate-600">
            Received: <span className="font-semibold text-slate-800">{p.receivedAt ? new Date(p.receivedAt).toLocaleDateString() : 'Not Yet'}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <User className="w-4 h-4 text-blue-600" /> Authorized By
          </div>
          <p className="font-semibold text-slate-800 text-sm">Created: {p.createdBy?.name || 'Admin'}</p>
          {p.receivedBy && <p className="text-xs text-slate-500">Received By: {p.receivedBy?.name}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Ordered Items</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3 text-center">Quantity</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {p.items?.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-800">{item.product?.name || 'Product'}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.product?.sku || 'N/A'}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-800">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-slate-600">₹{(item.unitPrice || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  ₹{((item.totalPrice) || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-slate-900">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-right text-base">Total Order Value:</td>
              <td className="px-6 py-4 text-right text-xl text-blue-600">₹{(p.totalAmount || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {p.notes && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Notes & Instructions</p>
          <p className="text-sm text-slate-700">{p.notes}</p>
        </div>
      )}
    </div>
  )
}
