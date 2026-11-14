export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  isActive: boolean
  avatar?: string
  lastLogin?: string
  createdAt: string
}

export interface Category {
  _id: string
  name: string
  description?: string
  productCount?: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  _id: string
  name: string
  company?: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  sku: string
  description?: string
  category: Category | string
  supplier: Supplier | string
  price: number
  costPrice: number
  quantity: number
  minStockLevel: number
  maxStockLevel?: number
  unit: string
  image?: string
  isActive: boolean
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  createdAt: string
  updatedAt: string
}

export interface InventoryTransaction {
  _id: string
  product: Product | string
  type: 'stock_in' | 'stock_out' | 'adjustment'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  reference?: string
  performedBy: User | string
  createdAt: string
}

export interface PurchaseItem {
  product: Product | string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
}

export interface Purchase {
  _id: string
  orderNumber: string
  supplier: Supplier | string
  items: PurchaseItem[]
  totalAmount: number
  status: 'pending' | 'ordered' | 'partially_received' | 'received' | 'cancelled'
  orderDate: string
  expectedDelivery?: string
  receivedDate?: string
  notes?: string
  createdBy: User | string
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  product: Product | string
  quantity: number
  unitPrice: number
  discount?: number
  totalPrice: number
}

export interface Sale {
  _id: string
  invoiceNumber: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  items: SaleItem[]
  subtotal: number
  discount?: number
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'credit'
  paymentStatus: 'paid' | 'pending' | 'partial'
  notes?: string
  soldBy: User | string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  relatedTo?: string
  createdAt: string
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalSuppliers: number
  totalSales: number
  totalSalesAmount: number
  totalPurchases: number
  totalPurchasesAmount: number
  lowStockCount: number
  outOfStockCount: number
  totalInventoryValue: number
  monthlySales?: Array<{ month: string; amount: number; count: number }>
  monthlyPurchases?: Array<{ month: string; amount: number; count: number }>
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: PaginationInfo
}
