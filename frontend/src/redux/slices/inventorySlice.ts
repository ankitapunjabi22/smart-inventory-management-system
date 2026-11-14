import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { InventoryTransaction, PaginationInfo } from '../../types'

interface InventoryState {
  transactions: InventoryTransaction[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo
}

const initialState: InventoryState = {
  transactions: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const stockIn = createAsyncThunk(
  'inventory/stockIn',
  async (data: { product: string; quantity: number; reason?: string; reference?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-in', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Stock in failed')
    }
  }
)

export const stockOut = createAsyncThunk(
  'inventory/stockOut',
  async (data: { product: string; quantity: number; reason?: string; reference?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-out', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Stock out failed')
    }
  }
)

export const adjustment = createAsyncThunk(
  'inventory/adjustment',
  async (data: { product: string; quantity: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/adjustment', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Adjustment failed')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/inventory/transactions?${query}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = action.payload.data || []
        if (action.payload.pagination) state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(stockIn.pending, (state) => { state.isLoading = true })
      .addCase(stockIn.fulfilled, (state) => { state.isLoading = false })
      .addCase(stockIn.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
      .addCase(stockOut.pending, (state) => { state.isLoading = true })
      .addCase(stockOut.fulfilled, (state) => { state.isLoading = false })
      .addCase(stockOut.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
      .addCase(adjustment.pending, (state) => { state.isLoading = true })
      .addCase(adjustment.fulfilled, (state) => { state.isLoading = false })
      .addCase(adjustment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
