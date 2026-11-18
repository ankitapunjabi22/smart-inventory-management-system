require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch (e) {}

const User = require('../models/User')

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB Connected')

    const accounts = [
      { email: 'admin@inventory.com', plain: 'Admin@123' },
      { email: 'manager@inventory.com', plain: 'Manager@123' },
      { email: 'staff@inventory.com', plain: 'Staff@123' }
    ]

    for (const acc of accounts) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(acc.plain, salt)
      await User.updateOne({ email: acc.email }, { $set: { password: hashedPassword } })
      console.log(`✅ Hashed password for ${acc.email}`)
    }

    // Verify
    const admin = await User.findOne({ email: 'admin@inventory.com' }).select('+password')
    const match = await bcrypt.compare('Admin@123', admin.password)
    console.log(`🔍 Verification check for Admin@123: ${match ? 'SUCCESS (PASSWORDS MATCH!)' : 'FAILED'}`)

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

run()
