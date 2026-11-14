import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Sale, PaginationInfo } from '../../types'

interface SaleState {
  sales: Sale[]
  currentSale: Sale | null
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo
}

const initialState: SaleState = {
  sales: [],
  currentSale: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchSales = createAsyncThunk(
  'sales/fetchAll',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/sales?${query}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales')
    }
  }
)

export const fetchSale = createAsyncThunk(
  'sales/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale')
    }
  }
)

export const createSale = createAsyncThunk(
  'sales/create',
  async (data: Partial<Sale>, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale')
    }
  }
)

const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearCurrentSale: (state) => { state.currentSale = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false
        state.sales = action.payload.data || []
        if (action.payload.pagination) state.pagination = action.payload.pagination
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(fetchSale.pending, (state) => { state.isLoading = true })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSale = action.payload.data || action.payload
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(createSale.pending, (state) => { state.isLoading = true })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isLoading = false
        state.sales.unshift(action.payload.data || action.payload)
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
  },
})

export const { clearCurrentSale, clearError } = saleSlice.actions
export default saleSlice.reducer
