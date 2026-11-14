import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { DashboardStats, Product, Sale, Purchase } from '../../types'

interface DashboardState {
  stats: DashboardStats | null
  salesChart: Array<{ month: number; year: number; totalRevenue: number; totalSales: number; label: string }>
  purchaseChart: Array<{ month: number; year: number; totalAmount: number; totalPurchases: number; label: string }>
  lowStockProducts: Product[]
  recentSales: Sale[]
  recentPurchases: Purchase[]
  isLoading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  salesChart: [],
  purchaseChart: [],
  lowStockProducts: [],
  recentSales: [],
  recentPurchases: [],
  isLoading: false,
  error: null,
}

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/sales-chart')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales chart')
    }
  }
)

export const fetchPurchaseChart = createAsyncThunk(
  'dashboard/fetchPurchaseChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/purchase-chart')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase chart')
    }
  }
)

export const fetchLowStockAlert = createAsyncThunk(
  'dashboard/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/low-stock')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock')
    }
  }
)

export const fetchRecentSales = createAsyncThunk(
  'dashboard/fetchRecentSales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-sales')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent sales')
    }
  }
)

export const fetchRecentPurchases = createAsyncThunk(
  'dashboard/fetchRecentPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-purchases')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent purchases')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload.data || action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesChart = action.payload.data?.salesChart || []
      })
      .addCase(fetchPurchaseChart.fulfilled, (state, action) => {
        state.purchaseChart = action.payload.data?.purchaseChart || []
      })
      .addCase(fetchLowStockAlert.fulfilled, (state, action) => {
        state.lowStockProducts = action.payload.data?.products || []
      })
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.recentSales = action.payload.data?.sales || []
      })
      .addCase(fetchRecentPurchases.fulfilled, (state, action) => {
        state.recentPurchases = action.payload.data?.purchases || []
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
