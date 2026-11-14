import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Purchase, PaginationInfo } from '../../types'

interface PurchaseState {
  purchases: Purchase[]
  currentPurchase: Purchase | null
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo
}

const initialState: PurchaseState = {
  purchases: [],
  currentPurchase: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchAll',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/purchases?${query}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchases')
    }
  }
)

export const fetchPurchase = createAsyncThunk(
  'purchases/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchases/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase')
    }
  }
)

export const createPurchase = createAsyncThunk(
  'purchases/create',
  async (data: Partial<Purchase>, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchases', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create purchase')
    }
  }
)

export const receivePurchase = createAsyncThunk(
  'purchases/receive',
  async ({ id, items }: { id: string; items?: Array<{ product: string; receivedQuantity: number }> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}/receive`, { items })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to receive purchase')
    }
  }
)

export const cancelPurchase = createAsyncThunk(
  'purchases/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}/cancel`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel purchase')
    }
  }
)

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearCurrentPurchase: (state) => { state.currentPurchase = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.isLoading = false
        state.purchases = action.payload.data || []
        if (action.payload.pagination) state.pagination = action.payload.pagination
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(fetchPurchase.pending, (state) => { state.isLoading = true })
      .addCase(fetchPurchase.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPurchase = action.payload.data || action.payload
      })
      .addCase(fetchPurchase.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(createPurchase.pending, (state) => { state.isLoading = true })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.isLoading = false
        state.purchases.unshift(action.payload.data || action.payload)
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(receivePurchase.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.purchases.findIndex(p => p._id === updated._id)
        if (idx !== -1) state.purchases[idx] = updated
        state.currentPurchase = updated
      })
      .addCase(cancelPurchase.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload
        const idx = state.purchases.findIndex(p => p._id === updated._id)
        if (idx !== -1) state.purchases[idx] = updated
        state.currentPurchase = updated
      })
  },
})

export const { clearCurrentPurchase, clearError } = purchaseSlice.actions
export default purchaseSlice.reducer
