require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('express-async-errors')

const connectDB = require('./config/db')
const { initializeSocket } = require('./sockets/socketHandler')
const errorHandler = require('./middleware/errorHandler')

// Import routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const supplierRoutes = require('./routes/suppliers')
const inventoryRoutes = require('./routes/inventory')
const purchaseRoutes = require('./routes/purchases')
const saleRoutes = require('./routes/sales')
const dashboardRoutes = require('./routes/dashboard')
const reportRoutes = require('./routes/reports')
const userRoutes = require('./routes/users')
const notificationRoutes = require('./routes/notifications')

const app = express()
const httpServer = http.createServer(app)

// CORS configuration supporting dynamic localhost development ports & production
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.onrender\.com$/.test(origin) ||
      origin === process.env.CLIENT_URL
    ) {
      return callback(null, true)
    }
    return callback(new Error('Blocked by CORS policy'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions
})

// Make io available in controllers via req.io
app.use((req, _res, next) => { req.io = io; next() })

// Connect DB
connectDB()

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }))

// Initialize Socket.IO
initializeSocket(io)

// Error handler (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = { app, io, httpServer }
