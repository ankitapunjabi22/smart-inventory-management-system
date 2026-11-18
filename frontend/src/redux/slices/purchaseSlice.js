 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'










const initialState = {
  purchases: [],
  currentPurchase: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/purchases?${query}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to fetch purchases')
    }
  }
)

export const fetchPurchase = createAsyncThunk(
  'purchases/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchases/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.message]) || 'Failed to fetch purchase')
    }
  }
)

export const createPurchase = createAsyncThunk(
  'purchases/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchases', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to create purchase')
    }
  }
)

export const receivePurchase = createAsyncThunk(
  'purchases/receive',
  async ({ id, items }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}/receive`, { items })
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _10 => _10.response, 'optionalAccess', _11 => _11.data, 'optionalAccess', _12 => _12.message]) || 'Failed to receive purchase')
    }
  }
)

export const cancelPurchase = createAsyncThunk(
  'purchases/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchases/${id}/cancel`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _13 => _13.response, 'optionalAccess', _14 => _14.data, 'optionalAccess', _15 => _15.message]) || 'Failed to cancel purchase')
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
        const payloadData = _optionalChain([action, 'access', _16 => _16.payload, 'optionalAccess', _17 => _17.data]) || action.payload || {}
        state.purchases = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.purchases) ? payloadData.purchases : [])
        if (payloadData.pagination) state.pagination = payloadData.pagination
        else if (_optionalChain([action, 'access', _18 => _18.payload, 'optionalAccess', _19 => _19.pagination])) state.pagination = action.payload.pagination
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(fetchPurchase.pending, (state) => { state.isLoading = true })
      .addCase(fetchPurchase.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _20 => _20.payload, 'optionalAccess', _21 => _21.data]) || action.payload || {}
        state.currentPurchase = payloadData.purchase || payloadData
      })
      .addCase(fetchPurchase.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(createPurchase.pending, (state) => { state.isLoading = true })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _22 => _22.payload, 'optionalAccess', _23 => _23.data]) || action.payload || {}
        const purchase = payloadData.purchase || payloadData
        if (Array.isArray(state.purchases)) {
          state.purchases.unshift(purchase)
        } else {
          state.purchases = [purchase]
        }
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(receivePurchase.fulfilled, (state, action) => {
        const payloadData = _optionalChain([action, 'access', _24 => _24.payload, 'optionalAccess', _25 => _25.data]) || action.payload || {}
        const updated = payloadData.purchase || payloadData
        if (Array.isArray(state.purchases)) {
          const idx = state.purchases.findIndex(p => p._id === updated._id)
          if (idx !== -1) state.purchases[idx] = updated
        }
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
