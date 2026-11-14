const jwt = require('jsonwebtoken')
const User = require('../models/User')

const initializeSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`)

    // Join user-specific room
    socket.join(`user_${socket.user._id}`)
    // Join role-based room
    socket.join(`role_${socket.user.role}`)

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`)
    })
  })
}

// Helper to emit to all connected users
const emitToAll = (io, event, data) => io.emit(event, data)
const emitToRole = (io, role, event, data) => io.to(`role_${role}`).emit(event, data)
const emitToUser = (io, userId, event, data) => io.to(`user_${userId}`).emit(event, data)

module.exports = { initializeSocket, emitToAll, emitToRole, emitToUser }
