 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'










const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!storedToken,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _2 => _2.response, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.message]) || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', data)
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.message]) || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return rejectWithValue(_optionalChain([error, 'access', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'Failed to fetch user')
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout')
  } catch (e) {
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
        state.error = action.payload 
      })
      // Register
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload 
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const payloadData = _optionalChain([action, 'access', _11 => _11.payload, 'optionalAccess', _12 => _12.data]) || action.payload
        const user = _optionalChain([payloadData, 'optionalAccess', _13 => _13.user]) || payloadData
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
