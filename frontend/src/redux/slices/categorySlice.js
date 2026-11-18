 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'








const initialState = {
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
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _2 => _2.response, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]) || 'Failed to fetch categories')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.message]) || 'Failed to create category')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'Failed to update category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _11 => _11.response, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.message]) || 'Failed to delete category')
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
        const payloadData = _optionalChain([action, 'access', _14 => _14.payload, 'optionalAccess', _15 => _15.data]) || action.payload || {}
        state.categories = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData.categories) ? payloadData.categories : [])
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(createCategory.pending, (state) => { state.isLoading = true })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _16 => _16.payload, 'optionalAccess', _17 => _17.data]) || action.payload || {}
        const category = payloadData.category || payloadData
        if (Array.isArray(state.categories)) {
          state.categories.push(category)
        } else {
          state.categories = [category]
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(updateCategory.pending, (state) => { state.isLoading = true })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const payloadData = _optionalChain([action, 'access', _18 => _18.payload, 'optionalAccess', _19 => _19.data]) || action.payload || {}
        const updated = payloadData.category || payloadData
        if (Array.isArray(state.categories)) {
          const idx = state.categories.findIndex(c => c._id === updated._id)
          if (idx !== -1) state.categories[idx] = updated
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload 
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        if (Array.isArray(state.categories)) {
          state.categories = state.categories.filter(c => c._id !== action.payload)
        }
      })
  },
})

export const { clearError } = categorySlice.actions
export default categorySlice.reducer
