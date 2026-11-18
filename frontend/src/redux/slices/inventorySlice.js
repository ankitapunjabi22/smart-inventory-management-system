 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'









const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const stockIn = createAsyncThunk(
  'inventory/stockIn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-in', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Stock in failed')
    }
  }
)

export const stockOut = createAsyncThunk(
  'inventory/stockOut',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/stock-out', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.message]) || 'Stock out failed')
    }
  }
)

export const adjustment = createAsyncThunk(
  'inventory/adjustment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/adjustment', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Adjustment failed')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/inventory/transactions?${query}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _10 => _10.response, 'optionalAccess', _11 => _11.data, 'optionalAccess', _12 => _12.message]) || 'Failed to fetch transactions')
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
        const payloadData = _optionalChain([action, 'access', _13 => _13.payload, 'optionalAccess', _14 => _14.data]) || action.payload || {}
        state.transactions = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.transactions) ? payloadData.transactions : [])
        if (payloadData.pagination) state.pagination = payloadData.pagination
        else if (_optionalChain([action, 'access', _15 => _15.payload, 'optionalAccess', _16 => _16.pagination])) state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(stockIn.pending, (state) => { state.isLoading = true })
      .addCase(stockIn.fulfilled, (state) => { state.isLoading = false })
      .addCase(stockIn.rejected, (state, action) => { state.isLoading = false; state.error = action.payload  })
      .addCase(stockOut.pending, (state) => { state.isLoading = true })
      .addCase(stockOut.fulfilled, (state) => { state.isLoading = false })
      .addCase(stockOut.rejected, (state, action) => { state.isLoading = false; state.error = action.payload  })
      .addCase(adjustment.pending, (state) => { state.isLoading = true })
      .addCase(adjustment.fulfilled, (state) => { state.isLoading = false })
      .addCase(adjustment.rejected, (state, action) => { state.isLoading = false; state.error = action.payload  })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
