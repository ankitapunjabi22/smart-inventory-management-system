const mongoose = require('mongoose')
const dns = require('dns')

// Configure reliable DNS servers to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch (e) {
  // fallback if permissions or environment restricted
}

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    return
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db')
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
