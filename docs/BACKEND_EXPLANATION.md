# ⚙️ Node.js, Express & MVC Backend Architecture Guide

> **Project**: Smart Inventory Management System  
> **Backend Stack**: Node.js + Express.js + Mongoose + Socket.IO + Express-Validator + Multer

---

## 🏛️ 1. What is MVC Architecture?

MVC stands for **Model - View - Controller**:

- **Model (`backend/models/`)**: Represents data structure and business rules directly with the database (e.g. `Product.js`, `User.js`).
- **View (`frontend/src/`)**: The client-side visual presentation (React SPA). In modern full-stack web applications, the backend serves JSON responses rather than rendering server HTML templates.
- **Controller (`backend/controllers/`)**: The "Brain" containing the business logic. It handles incoming requests, validates input, calls models to query/update MongoDB, and returns JSON responses.
- **Routes (`backend/routes/`)**: The "Switchboard" mapping incoming HTTP URLs and methods (e.g. `POST /api/products`) to the right controller functions with the appropriate middleware.

---

## 🚀 2. Server Entry Point: `backend/index.js`

Here is how the server initializes in [backend/index.js](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/backend/index.js):

```javascript
require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('express-async-errors') // Catches unhandled promise rejections automatically

const connectDB = require('./config/db')
const { initializeSocket } = require('./sockets/socketHandler')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const httpServer = http.createServer(app)

// 1. Socket.IO initialization with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
})

// 2. Make io available inside controllers via req.io
app.use((req, _res, next) => { req.io = io; next() })

// 3. Connect to MongoDB
connectDB()

// 4. Security & Logging Middlewares
app.use(helmet()) // Sets secure HTTP response headers
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev')) // Logs incoming requests to console
app.use(express.json()) // Parses JSON request bodies
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads')) // Serves uploaded product photos

// 5. Mount API Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/suppliers', require('./routes/suppliers'))
app.use('/api/inventory', require('./routes/inventory'))
app.use('/api/purchases', require('./routes/purchases'))
app.use('/api/sales', require('./routes/sales'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/users', require('./routes/users'))
app.use('/api/notifications', require('./routes/notifications'))

// 6. Health Check Endpoint
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }))

// 7. Initialize Socket Authentication & Rooms
initializeSocket(io)

// 8. Centralized Error Handling Middleware (Always Last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = { app, io, httpServer }
```

---

## 🛡️ 3. Middleware Pipeline Explained

A **middleware** is a function that sits between the incoming request and the final controller execution. It can inspect, alter, or terminate the request.

```
Request ──> [helmet] ──> [cors] ──> [express.json] ──> [auth.js] ──> [authorize.js] ──> [Controller] ──> Response
                                                            │               │
                                                       (401 if no      (403 if wrong
                                                         token)            role)
```

1. **`middleware/auth.js`**:
   - Inspects `req.headers.authorization` for `Bearer <token>`.
   - Verifies the signature with `jwt.verify(token, JWT_SECRET)`.
   - Fetches the user from MongoDB and attaches it to `req.user`.
2. **`middleware/authorize.js`**:
   - Checks if `req.user.role` matches the allowed roles (e.g., `authorize('admin', 'manager')`).
   - If not allowed, halts request with `403 Forbidden`.
3. **`middleware/errorHandler.js`**:
   - Catches all errors from async controllers without crashing the Node.js server.
   - Formats Mongoose `CastError` (invalid ObjectId) as `400 Bad Request`.
   - Formats duplicate key `E11000` (e.g. duplicate SKU or email) as `409 Conflict`.
   - Formats Mongoose `ValidationError` as `400 Bad Request`.

---

## ⚡ 4. Real-Time Socket.IO Server: `sockets/socketHandler.js`

```javascript
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const initializeSocket = (io) => {
  // Handshake authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.user.name} (${socket.user.role})`)
    socket.join(`user_${socket.user._id}`)
    socket.join(`role_${socket.user.role}`)

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`)
    })
  })
}

module.exports = { initializeSocket }
```

### When Events Are Emitted:
- When a sale finishes in `saleController.js` $\rightarrow$ `req.io.emit('newSale', ...)` and `req.io.emit('lowStockAlert', ...)`.
- When stock is added in `inventoryController.js` $\rightarrow$ `req.io.emit('stockUpdated', ...)`.
- When a purchase order is received in `purchaseController.js` $\rightarrow$ `req.io.emit('newPurchase', ...)`.
