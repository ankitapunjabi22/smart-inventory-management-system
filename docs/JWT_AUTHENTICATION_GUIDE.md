# 🔐 JWT Authentication & RBAC Authorization Guide

> **Project**: Smart Inventory Management System  
> **Security Stack**: JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`) + Role-Based Access Control (RBAC)

---

## 📌 1. Foundational Security Concepts

### What is JWT (JSON Web Token)?
A **JSON Web Token (JWT)** is an open standard (RFC 7519) that defines a compact, URL-safe way to securely transmit information between parties as a digitally signed JSON object.

### Why do we use JWT instead of Session Cookies?
1. **Stateless Scalability**: The server does not keep a database of active user sessions in memory. Everything needed to identify the user is inside the token itself.
2. **Cross-Service Friendly**: Works seamlessly across mobile apps, single-page web applications (React SPA), and microservices.
3. **Decoupled Architecture**: The backend REST API can reside on one domain/port (e.g. `localhost:5000`) and the frontend on another (e.g. `localhost:5173`) without complex cross-domain cookie session sharing.

### Anatomy of a JWT Token
A JWT looks like three random strings separated by dots (`.`):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjFhMmIzYzRkNWU2ZjdhOGI5YzBkMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwNjA0ODAwfQ.SignatureStringHere
```

1. **Header (Red)**: Contains the token type (`JWT`) and the hashing algorithm used (e.g. `HMAC SHA256`).
2. **Payload (Purple)**: Contains claims and data (in our project, the user's `id` and token issue/expiration timestamps).
3. **Signature (Blue)**: A cryptographic hash of the Header + Payload + Secret Key:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{base64UrlEncode}(\text{Header}) + "." + \text{base64UrlEncode}(\text{Payload}), \text{secret})$$

> 💡 **Key Takeaway**: Anyone can read the payload (it is only Base64 encoded, not encrypted). However, **no one can tamper with or forge the payload without invalidating the signature**, because only the server knows the secret key!

---

## 🔄 2. The Complete 10-Step Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee (Client)
    participant React as React Frontend (Login.tsx)
    participant Redux as Redux Store (authSlice)
    participant Express as Express Server (routes/auth.js)
    participant Bcrypt as bcryptjs Password Engine
    participant Mongo as MongoDB (User Collection)
    participant JWT as jsonwebtoken Engine
    participant API as Protected APIs (e.g. /products)

    User->>React: Enters email & password
    React->>Redux: Dispatches loginUser({ email, password })
    Redux->>Express: POST /api/auth/login
    Express->>Mongo: User.findOne({ email }).select('+password')
    Mongo-->>Express: Returns user document with password hash
    Express->>Bcrypt: bcrypt.compare(enteredPassword, user.password)
    Bcrypt-->>Express: Returns true (Password Match)
    Express->>JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    JWT-->>Express: Generates Signed JWT String
    Express-->>Redux: 200 OK + { token, user: { name, email, role } }
    Redux->>React: Stores token in localStorage & updates Redux state
    React-->>User: Redirects to /dashboard

    Note over User,API: Making an Authenticated Request:
    User->>React: Navigates to /products
    React->>API: GET /api/products (Header: "Authorization: Bearer <token>")
    API->>Express: auth.js Middleware verifies token
    Express->>JWT: jwt.verify(token, JWT_SECRET)
    JWT-->>Express: Decodes { id: user._id }
    Express->>Mongo: User.findById(id).select('-password')
    Mongo-->>Express: Sets req.user = user
    API->>Express: authorize.js checks req.user.role
    Express-->>React: 200 OK with authorized product catalog
```

---

## 💻 3. The Code Behind the Security

### A. Password Hashing on Registration / User Creation
In [backend/models/User.js](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/backend/models/User.js):
```javascript
// Pre-save hook runs automatically before every document save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  // Generate salt (cost factor = 10 rounds of hashing)
  const salt = await bcrypt.genSalt(10)
  // Hash the plain-text password with salt
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}
```

### B. Token Generation
In [backend/utils/generateToken.js](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/backend/utils/generateToken.js):
```javascript
const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

module.exports = generateToken
```

### C. Authentication Middleware (Verifying Identity)
In [backend/middleware/auth.js](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/backend/middleware/auth.js):
```javascript
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' })
  }

  try {
    // Verify cryptographic signature against server secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to req.user (excluding password)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' })
  }
}

module.exports = protect
```

### D. Role-Based Authorization Middleware (Checking Permissions)
In [backend/middleware/authorize.js](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/backend/middleware/authorize.js):
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role "${req.user.role}" is not authorized to access this resource`
      })
    }

    next()
  }
}

module.exports = authorize
```

### E. Frontend Axios Interceptor (Auto-attaching Token)
In [frontend/src/services/api.ts](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/frontend/src/services/api.ts):
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Automatically attach Bearer token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercept 401 responses (e.g. token expired) and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### F. Frontend Route Protection
In [frontend/src/components/auth/ProtectedRoute.tsx](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/frontend/src/components/auth/ProtectedRoute.tsx):
```tsx
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
```

---

## 🛡️ 4. Role-Based Permissions Matrix

| Feature / Action | Admin | Manager | Floor Staff |
|---|:---:|:---:|:---:|
| **View Dashboard & Metrics** | ✅ Full | ✅ Full | ✅ Limited |
| **View Products Catalog** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create / Edit / Delete Products** | ✅ Full | ✅ Full | ❌ Blocked (403) |
| **Manage Categories & Suppliers** | ✅ Full | ✅ Full | ❌ Blocked (403) |
| **Stock In / Stock Out / Adjustments** | ✅ Full | ✅ Full | ❌ Blocked (403) |
| **Create Purchase Order** | ✅ Yes | ✅ Yes | ❌ Blocked (403) |
| **Receive Purchased Goods (Add Stock)**| ✅ Yes | ✅ Yes | ❌ Blocked (403) |
| **Create Sale / Print Tax Invoices** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Financial Valuation Reports** | ✅ Yes | ✅ Yes | ❌ Blocked (403) |
| **User Management & Role Assignment**| ✅ Yes | ❌ Blocked (403) | ❌ Blocked (403) |
