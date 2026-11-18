import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { fetchCurrentUser } from './redux/slices/authSlice'
import { useSocket } from './hooks/useSocket'

import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/products/Products'
import AddProduct from './pages/products/AddProduct'
import EditProduct from './pages/products/EditProduct'
import ProductDetail from './pages/products/ProductDetail'
import Categories from './pages/categories/Categories'
import Suppliers from './pages/suppliers/Suppliers'
import Inventory from './pages/inventory/Inventory'
import Purchases from './pages/purchases/Purchases'
import AddPurchase from './pages/purchases/AddPurchase'
import PurchaseDetail from './pages/purchases/PurchaseDetail'
import Sales from './pages/sales/Sales'
import AddSale from './pages/sales/AddSale'
import SaleDetail from './pages/sales/SaleDetail'
import Reports from './pages/reports/Reports'
import Notifications from './pages/notifications/Notifications'
import UserManagement from './pages/users/UserManagement'
import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(state => state.auth.token)

  useSocket(token)

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/add" element={<AddPurchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetail />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/add" element={<AddSale />} />
          <Route path="/sales/:id" element={<SaleDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
