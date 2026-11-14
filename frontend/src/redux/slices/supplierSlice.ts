import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Supplier } from '../../types'

interface SupplierState {
  suppliers: Supplier[]
  currentSupplier: Supplier | null
  isLoading: boolean
  error: string | null
}

const initialState: SupplierState = {
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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers')
    }
  }
)

export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (data: Partial<Supplier>, { rejectWithValue }) => {
    try {
      const response = await api.post('/suppliers', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier')
    }
  }
)

export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async ({ id, data }: { id: string; data: Partial<Supplier> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/suppliers/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier')
    }
  }
)

export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier')
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
        state.suppliers = action.payload.data || []
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(createSupplier.pending, (state) => { state.isLoading = true })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isLoading = false
        state.suppliers.push(action.payload.data || action.payload)
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(updateSupplier.pending, (state) => { state.isLoading = true })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false
        const updated = action.payload.data || action.payload
        const idx = state.suppliers.findIndex(s => s._id === updated._id)
        if (idx !== -1) state.suppliers[idx] = updated
        state.currentSupplier = updated
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s._id !== action.payload)
      })
  },
})

export const { clearError, clearCurrentSupplier } = supplierSlice.actions
export default supplierSlice.reducer
