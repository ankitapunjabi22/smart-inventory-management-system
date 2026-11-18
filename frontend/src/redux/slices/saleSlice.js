 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'










const initialState = {
  sales: [],
  currentSale: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchSales = createAsyncThunk(
  'sales/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/sales?${query}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to fetch sales')
    }
  }
)

export const fetchSale = createAsyncThunk(
  'sales/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.message]) || 'Failed to fetch sale')
    }
  }
)

export const createSale = createAsyncThunk(
  'sales/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to create sale')
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
        const payloadData = _optionalChain([action, 'access', _10 => _10.payload, 'optionalAccess', _11 => _11.data]) || action.payload || {}
        state.sales = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.sales) ? payloadData.sales : [])
        if (payloadData.pagination) state.pagination = payloadData.pagination
        else if (_optionalChain([action, 'access', _12 => _12.payload, 'optionalAccess', _13 => _13.pagination])) state.pagination = action.payload.pagination
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(fetchSale.pending, (state) => { state.isLoading = true })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _14 => _14.payload, 'optionalAccess', _15 => _15.data]) || action.payload || {}
        state.currentSale = payloadData.sale || payloadData
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(createSale.pending, (state) => { state.isLoading = true })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _16 => _16.payload, 'optionalAccess', _17 => _17.data]) || action.payload || {}
        const sale = payloadData.sale || payloadData
        if (Array.isArray(state.sales)) {
          state.sales.unshift(sale)
        } else {
          state.sales = [sale]
        }
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
  },
})

export const { clearCurrentSale, clearError } = saleSlice.actions
export default saleSlice.reducer
