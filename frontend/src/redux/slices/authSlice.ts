import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!storedToken,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout')
  } catch {
    // ignore errors
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        const { token, user } = action.payload.data || action.payload
        state.token = token
        state.user = user
        state.isAuthenticated = true
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Register
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload.data || action.payload
        state.user = user
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(user))
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, clearAuth } = authSlice.actions
export default authSlice.reducer
