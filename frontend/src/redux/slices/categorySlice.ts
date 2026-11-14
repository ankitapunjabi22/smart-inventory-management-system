import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Category } from '../../types'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: { name: string; description?: string } }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category')
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.data || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(createCategory.pending, (state) => { state.isLoading = true })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories.push(action.payload.data || action.payload)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(updateCategory.pending, (state) => { state.isLoading = true })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const updated = action.payload.data || action.payload
        const idx = state.categories.findIndex(c => c._id === updated._id)
        if (idx !== -1) state.categories[idx] = updated
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c._id !== action.payload)
      })
  },
})

export const { clearError } = categorySlice.actions
export default categorySlice.reducer
