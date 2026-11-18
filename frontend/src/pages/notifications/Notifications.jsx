import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info, ShoppingCart, Truck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead
} from '../../redux/slices/notificationSlice'
import Button from '../../components/common/Button'

import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'


export default function Notifications() {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount, isLoading } = useAppSelector(state => state.notifications)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchNotifications(filter === 'unread' ? { unread: true } : {}))
  }, [dispatch, filter])

  const handleMarkOne = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap()
    } catch (err) {
      toast.error('Failed to mark notification')
    }
  }

  const handleMarkAll = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      toast.success('All marked as read')
    } catch (err) {
      toast.error('Failed to mark all')
    }
  }

  const getIcon = (type) => {
    if (type === 'low_stock' || type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />
    if (type === 'out_of_stock' || type === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />
    if (type === 'new_sale') return <ShoppingCart className="w-5 h-5 text-green-500" />
    if (type === 'new_purchase') return <Truck className="w-5 h-5 text-blue-500" />
    return <Info className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Notifications Center</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts, stock threshold warnings and system events</p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAll} className="gap-2">
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${filter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${filter === 'unread' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">You are all caught up! Warehouse operations are quiet.</p>
          </div>
        ) : (
          (Array.isArray(notifications) ? notifications : []).map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkOne(n._id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'}`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                  </span>
                  {!n.isRead && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkOne(n._id)
                  }}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
