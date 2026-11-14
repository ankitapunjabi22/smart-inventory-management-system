import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Product, PaginationInfo } from '../../types'

interface ProductState {
  products: Product[]
  currentProduct: Product | null
  lowStockProducts: Product[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  lowStockProducts: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const response = await api.get(`/products?${query}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product')
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/create',
  async (data: FormData | Record<string, any>, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData
      const response = await api.post('/products', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: string; data: FormData | Record<string, any> }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData
      const response = await api.put(`/products/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product')
    }
  }
)

export const fetchLowStockProducts = createAsyncThunk(
  'products/lowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/low-stock')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock')
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
        state.products = action.payload.data || []
        if (action.payload.pagination) state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(fetchProduct.pending, (state) => { state.isLoading = true })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload.data || action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(createProduct.pending, (state) => { state.isLoading = true })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const product = action.payload.data || action.payload
        state.products.unshift(product)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(updateProduct.pending, (state) => { state.isLoading = true })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const updated = action.payload.data || action.payload
        const idx = state.products.findIndex(p => p._id === updated._id)
        if (idx !== -1) state.products[idx] = updated
        state.currentProduct = updated
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload)
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.lowStockProducts = action.payload.data || []
      })
  },
})

export const { clearCurrentProduct, clearError } = productSlice.actions
export default productSlice.reducer
