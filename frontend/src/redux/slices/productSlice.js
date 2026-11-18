 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'











const initialState = {
  products: [],
  currentProduct: null,
  lowStockProducts: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/products?${query}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _2 => _2.response, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]) || 'Failed to fetch products')
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.message]) || 'Failed to fetch product')
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/create',
  async (data, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData
      const response = await api.post('/products', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData
      const response = await api.put(`/products/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.message]) || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _14 => _14.response, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.message]) || 'Failed to delete product')
    }
  }
)

export const fetchLowStockProducts = createAsyncThunk(
  'products/lowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/low-stock')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _17 => _17.response, 'optionalAccess', _18 => _18.data, 'optionalAccess', _19 => _19.message]) || 'Failed to fetch low stock')
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _20 => _20.payload, 'optionalAccess', _21 => _21.data]) || action.payload || {}
        state.products = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.products) ? payloadData.products : [])
        if (payloadData.pagination) state.pagination = payloadData.pagination
        else if (_optionalChain([action, 'access', _22 => _22.payload, 'optionalAccess', _23 => _23.pagination])) state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(fetchProduct.pending, (state) => { state.isLoading = true })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _24 => _24.payload, 'optionalAccess', _25 => _25.data]) || action.payload || {}
        state.currentProduct = payloadData.product || payloadData
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(createProduct.pending, (state) => { state.isLoading = true })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _26 => _26.payload, 'optionalAccess', _27 => _27.data]) || action.payload || {}
        const product = payloadData.product || payloadData
        if (Array.isArray(state.products)) {
          state.products.unshift(product)
        } else {
          state.products = [product]
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(updateProduct.pending, (state) => { state.isLoading = true })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _28 => _28.payload, 'optionalAccess', _29 => _29.data]) || action.payload || {}
        const updated = payloadData.product || payloadData
        if (Array.isArray(state.products)) {
          const idx = state.products.findIndex(p => p._id === updated._id)
          if (idx !== -1) state.products[idx] = updated
        }
        state.currentProduct = updated
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        if (Array.isArray(state.products)) {
          state.products = state.products.filter(p => p._id !== action.payload)
        }
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        const payloadData = _optionalChain([action, 'access', _30 => _30.payload, 'optionalAccess', _31 => _31.data]) || action.payload || {}
        state.lowStockProducts = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.products) ? payloadData.products : [])
      })
  },
})

export const { clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
