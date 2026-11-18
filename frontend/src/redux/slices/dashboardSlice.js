 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'













const initialState = {
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
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _2 => _2.response, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]) || 'Failed to fetch stats')
    }
  }
)

export const fetchSalesChart = createAsyncThunk(
  'dashboard/fetchSalesChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/sales-chart')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.message]) || 'Failed to fetch sales chart')
    }
  }
)

export const fetchPurchaseChart = createAsyncThunk(
  'dashboard/fetchPurchaseChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/purchase-chart')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'Failed to fetch purchase chart')
    }
  }
)

export const fetchLowStockAlert = createAsyncThunk(
  'dashboard/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/low-stock')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.message]) || 'Failed to fetch low stock')
    }
  }
)

export const fetchRecentSales = createAsyncThunk(
  'dashboard/fetchRecentSales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-sales')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _14 => _14.response, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.message]) || 'Failed to fetch recent sales')
    }
  }
)

export const fetchRecentPurchases = createAsyncThunk(
  'dashboard/fetchRecentPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/recent-purchases')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _17 => _17.response, 'optionalAccess', _18 => _18.data, 'optionalAccess', _19 => _19.message]) || 'Failed to fetch recent purchases')
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
        state.error = action.payload 
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesChart = _optionalChain([action, 'access', _20 => _20.payload, 'access', _21 => _21.data, 'optionalAccess', _22 => _22.salesChart]) || []
      })
      .addCase(fetchPurchaseChart.fulfilled, (state, action) => {
        state.purchaseChart = _optionalChain([action, 'access', _23 => _23.payload, 'access', _24 => _24.data, 'optionalAccess', _25 => _25.purchaseChart]) || []
      })
      .addCase(fetchLowStockAlert.fulfilled, (state, action) => {
        state.lowStockProducts = _optionalChain([action, 'access', _26 => _26.payload, 'access', _27 => _27.data, 'optionalAccess', _28 => _28.products]) || []
      })
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.recentSales = _optionalChain([action, 'access', _29 => _29.payload, 'access', _30 => _30.data, 'optionalAccess', _31 => _31.sales]) || []
      })
      .addCase(fetchRecentPurchases.fulfilled, (state, action) => {
        state.recentPurchases = _optionalChain([action, 'access', _32 => _32.payload, 'access', _33 => _33.data, 'optionalAccess', _34 => _34.purchases]) || []
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
