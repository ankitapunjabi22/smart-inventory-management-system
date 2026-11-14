const request = require('supertest')
const mongoose = require('mongoose')
const { app } = require('../index')
const User = require('../models/User')

// Use a separate test database
const TEST_DB = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/inventory_test'

let token = ''
let testUserId = ''

beforeAll(async () => {
  await mongoose.connect(TEST_DB)
  // Clean up test users before running
  await User.deleteMany({ email: { $in: ['testregister@test.com', 'logintest@test.com'] } })
})

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['testregister@test.com', 'logintest@test.com'] } })
  await mongoose.connection.close()
})

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Register',
      email: 'testregister@test.com',
      password: 'Test@123'
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data.user.email).toBe('testregister@test.com')
  })

  it('should return 409 for duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'testregister@test.com',
      password: 'Test@123'
    })

    expect(res.statusCode).toBe(409)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'logintest@test.com',
      password: 'Login@123'
    })
  })

  it('should login successfully with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'logintest@test.com',
      password: 'Login@123'
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('token')
    token = res.body.data.token
  })

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'logintest@test.com',
      password: 'wrongpassword'
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/auth/me', () => {
  it('should return current user with valid token', async () => {
    // Ensure we have a valid token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'logintest@test.com',
      password: 'Login@123'
    })
    const validToken = loginRes.body.data?.token

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user).toHaveProperty('email', 'logintest@test.com')
  })

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })
})
