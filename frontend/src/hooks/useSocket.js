import { useEffect, useRef } from 'react'
import { io, } from 'socket.io-client'
import { useAppDispatch } from '../redux/hooks'
import { addNotification, incrementUnread } from '../redux/slices/notificationSlice'
import toast from 'react-hot-toast'

export const useSocket = (token) => {
  const socketRef = useRef(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!token) return

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => console.log('Socket connected'))
    socket.on('disconnect', () => console.log('Socket disconnected'))

    socket.on('stockUpdated', (data) => {
      toast.success(`Stock updated: ${data.productName}`)
    })

    socket.on('lowStockAlert', (data) => {
      toast.error(`Low Stock Alert: ${data.productName} (${data.quantity} remaining)`)
      dispatch(incrementUnread())
    })

    socket.on('outOfStockAlert', (data) => {
      toast.error(`OUT OF STOCK: ${data.productName}`)
      dispatch(incrementUnread())
    })

    socket.on('newSale', (data) => {
      toast.success(`New Sale: ₹${data.totalAmount}`)
      dispatch(incrementUnread())
    })

    socket.on('newPurchase', () => {
      toast.success('New Purchase received')
      dispatch(incrementUnread())
    })

    socket.on('newNotification', (notification) => {
      dispatch(addNotification(notification))
      dispatch(incrementUnread())
    })

    return () => {
      socket.disconnect()
    }
  }, [token, dispatch])

  return socketRef.current
}
