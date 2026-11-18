 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'









const initialState = {
  suppliers: [],
  currentSupplier: null,
  isLoading: false,
  error: null,
}

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/suppliers')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _2 => _2.response, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]) || 'Failed to fetch suppliers')
    }
  }
)

export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/suppliers', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.message]) || 'Failed to create supplier')
    }
  }
)

export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/suppliers/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'Failed to update supplier')
    }
  }
)

export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.message]) || 'Failed to delete supplier')
    }
  }
)

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearCurrentSupplier: (state) => { state.currentSupplier = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _14 => _14.payload, 'optionalAccess', _15 => _15.data]) || action.payload || {}
        state.suppliers = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.suppliers) ? payloadData.suppliers : [])
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(createSupplier.pending, (state) => { state.isLoading = true })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _16 => _16.payload, 'optionalAccess', _17 => _17.data]) || action.payload || {}
        const supplier = payloadData.supplier || payloadData
        if (Array.isArray(state.suppliers)) {
          state.suppliers.push(supplier)
        } else {
          state.suppliers = [supplier]
        }
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(updateSupplier.pending, (state) => { state.isLoading = true })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _18 => _18.payload, 'optionalAccess', _19 => _19.data]) || action.payload || {}
        const updated = payloadData.supplier || payloadData
        if (Array.isArray(state.suppliers)) {
          const idx = state.suppliers.findIndex(s => s._id === updated._id)
          if (idx !== -1) state.suppliers[idx] = updated
        }
        state.currentSupplier = updated
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        if (Array.isArray(state.suppliers)) {
          state.suppliers = state.suppliers.filter(s => s._id !== action.payload)
        }
      })
  },
})

export const { clearError, clearCurrentSupplier } = supplierSlice.actions
export default supplierSlice.reducer
