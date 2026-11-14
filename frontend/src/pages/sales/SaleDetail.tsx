import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer, CheckCircle, TrendingUp, User, CreditCard } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchSale } from '../../redux/slices/saleSlice'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { currentSale, isLoading } = useAppSelector(state => state.sales)

  useEffect(() => {
    if (id) dispatch(fetchSale(id))
  }, [dispatch, id])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading || !currentSale) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const s: any = currentSale

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header controls (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/sales" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sale Invoice</h1>
            <p className="text-sm text-slate-500">Official receipt & dispatch document</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Print Tax Invoice
        </Button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Brand & Invoice Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-blue-600 tracking-tight">SMART INVENTORY</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enterprise Stock & Supply Chain Management</p>
            <p className="text-xs text-slate-400 mt-2">GSTIN: 29AAAAA0000A1Z5</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Tax Invoice</p>
            <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
              {s.saleId || s.invoiceNumber || s._id}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Date: {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'}
            </p>
            <div className="mt-2">
              <Badge variant={s.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {s.paymentStatus === 'paid' ? 'Paid in Full' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer & Payment Meta */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Billed To</p>
            <p className="font-bold text-slate-800 text-base">{s.customer?.name || 'Walk-in Retail Customer'}</p>
            {s.customer?.phone && <p className="text-slate-600 mt-0.5">Phone: {s.customer.phone}</p>}
            {s.customer?.email && <p className="text-slate-600">Email: {s.customer.email}</p>}
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Payment Method</p>
            <p className="font-semibold text-slate-800 capitalize">{s.paymentMethod || 'Cash'}</p>
            <p className="text-xs text-slate-500 mt-1">Cashier / Staff: {s.createdBy?.name || 'System'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Product Item</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {item.product?.name || 'Product item'}
                    {item.product?.sku && <span className="block text-xs font-mono text-slate-400">SKU: {item.product.sku}</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">₹{(item.unitPrice || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    ₹{((item.totalPrice) || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Block */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-800">₹{(s.subtotal || s.totalAmount || 0).toLocaleString()}</span>
            </div>
            {s.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>- ₹{s.discount.toLocaleString()}</span>
              </div>
            )}
            {s.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span>+ ₹{s.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-lg">
              <span>Grand Total:</span>
              <span className="text-blue-600">₹{(s.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          <p>Thank you for choosing Smart Inventory Management. Goods once sold are subject to standard return policy.</p>
          <p className="mt-1 font-mono text-[10px]">Verified Digital Invoice Record</p>
        </div>
      </div>
    </div>
  )
}
