import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Notification } from '../../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params: { unread?: boolean } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as any).toString()
      const response = await api.get(`/notifications?${query}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notifications/${id}/read`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read')
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/notifications/mark-all-read')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch count')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
    },
    incrementUnread: (state) => {
      state.unreadCount += 1
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.data || []
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.notifications.findIndex(n => n._id === updated._id)
        if (idx !== -1) state.notifications[idx] = updated
        if (state.unreadCount > 0) state.unreadCount -= 1
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data?.count ?? action.payload.count ?? 0
      })
  },
})

export const { addNotification, incrementUnread, clearError } = notificationSlice.actions
export default notificationSlice.reducer
