import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppDispatch } from '../redux/hooks'
import { addNotification, incrementUnread } from '../redux/slices/notificationSlice'
import toast from 'react-hot-toast'

export const useSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null)
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

    socket.on('stockUpdated', (data: { productName: string }) => {
      toast.success(`Stock updated: ${data.productName}`)
    })

    socket.on('lowStockAlert', (data: { productName: string; quantity: number }) => {
      toast.error(`Low Stock Alert: ${data.productName} (${data.quantity} remaining)`)
      dispatch(incrementUnread())
    })

    socket.on('outOfStockAlert', (data: { productName: string }) => {
      toast.error(`OUT OF STOCK: ${data.productName}`)
      dispatch(incrementUnread())
    })

    socket.on('newSale', (data: { totalAmount: number }) => {
      toast.success(`New Sale: ₹${data.totalAmount}`)
      dispatch(incrementUnread())
    })

    socket.on('newPurchase', () => {
      toast.success('New Purchase received')
      dispatch(incrementUnread())
    })

    socket.on('newNotification', (notification: any) => {
      dispatch(addNotification(notification))
      dispatch(incrementUnread())
    })

    return () => {
      socket.disconnect()
    }
  }, [token, dispatch])

  return socketRef.current
}
