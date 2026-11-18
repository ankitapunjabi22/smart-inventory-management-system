require('dotenv').config()
const dns = require('dns')
try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch (e) {}

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Category = require('../models/Category')
const Supplier = require('../models/Supplier')
const Product = require('../models/Product')
const Purchase = require('../models/Purchase')
const Sale = require('../models/Sale')
const InventoryTransaction = require('../models/InventoryTransaction')
const Notification = require('../models/Notification')

const connectDB = require('../config/db')

const seedAll = async () => {
  try {
    await connectDB()
    console.log('🌱 Starting comprehensive test dataset seed...\n')

    // ─── 1. USERS (Admin, Manager, Staff) ────────────────────────────────────
    const usersConfig = [
      { name: 'Admin User', email: 'admin@inventory.com', password: 'Admin@123', role: 'admin' },
      { name: 'Manager User', email: 'manager@inventory.com', password: 'Manager@123', role: 'manager' },
      { name: 'Staff User', email: 'staff@inventory.com', password: 'Staff@123', role: 'staff' },
      { name: 'Rohit Verma (Operations Manager)', email: 'rohit.manager@inventory.com', password: 'Manager@123', role: 'manager' },
      { name: 'Ananya Roy (Billing Counter)', email: 'ananya.staff@inventory.com', password: 'Staff@123', role: 'staff' },
      { name: 'Karan Mehta (Warehouse Staff)', email: 'karan.staff@inventory.com', password: 'Staff@123', role: 'staff' }
    ]

    for (const u of usersConfig) {
      let userDoc = await User.findOne({ email: u.email })
      if (!userDoc) {
        userDoc = await User.create({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          isActive: true
        })
        console.log(`  + User created: ${u.email} [${u.role}]`)
      } else {
        userDoc.name = u.name
        userDoc.role = u.role
        userDoc.isActive = true
        userDoc.password = u.password
        await userDoc.save()
        console.log(`  * User password & role verified: ${u.email} [${u.role}]`)
      }
    }

    const admin = await User.findOne({ email: 'admin@inventory.com' })
    const manager = await User.findOne({ email: 'manager@inventory.com' })
    const staff = await User.findOne({ email: 'staff@inventory.com' })

    // ─── 2. CATEGORIES ───────────────────────────────────────────────────────
    const categoriesData = [
      { name: 'Electronics', description: 'Gadgets, computers and consumer electronics', color: '#3B82F6', icon: 'cpu' },
      { name: 'Clothing', description: 'Men and women apparel & textiles', color: '#EC4899', icon: 'shirt' },
      { name: 'Food & Beverages', description: 'Packaged pantry items and beverages', color: '#F59E0B', icon: 'coffee' },
      { name: 'Office Supplies', description: 'Stationery, paper and office accessories', color: '#10B981', icon: 'briefcase' },
      { name: 'Furniture', description: 'Ergonomic chairs, desks and storage units', color: '#8B5CF6', icon: 'home' }
    ]

    for (const c of categoriesData) {
      const exists = await Category.findOne({ name: c.name })
      if (!exists) {
        await Category.create({ ...c, createdBy: admin._id })
      }
    }
    const categories = await Category.find()
    console.log(`✅ Categories verified (${categories.length} total)`)

    // ─── 3. SUPPLIERS ────────────────────────────────────────────────────────
    const suppliersData = [
      {
        name: 'Ravi Kumar',
        companyName: 'TechWorld Distributors',
        email: 'ravi@techworld.com',
        phone: '9876543210',
        address: { street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
        gstNumber: '29AABCT1332L1Z5'
      },
      {
        name: 'Priya Sharma',
        companyName: 'FashionHub Wholesale',
        email: 'priya@fashionhub.com',
        phone: '9123456789',
        address: { street: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', country: 'India' },
        gstNumber: '27AAHCF1234M1Z3'
      },
      {
        name: 'Suresh Patel',
        companyName: 'OfficeZone Supplies',
        email: 'suresh@officezone.com',
        phone: '9988776655',
        address: { street: '78 CG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', country: 'India' },
        gstNumber: '24AABCP5678K1Z8'
      }
    ]

    for (const s of suppliersData) {
      const exists = await Supplier.findOne({ email: s.email })
      if (!exists) {
        await Supplier.create({ ...s, createdBy: admin._id })
      }
    }
    const suppliers = await Supplier.find()
    console.log(`✅ Suppliers verified (${suppliers.length} total)`)

    // ─── 4. PRODUCTS ─────────────────────────────────────────────────────────
    const elecCat = categories.find(c => c.name === 'Electronics')?._id || categories[0]._id
    const clothCat = categories.find(c => c.name === 'Clothing')?._id || categories[1]._id
    const officeCat = categories.find(c => c.name === 'Office Supplies')?._id || categories[2]._id

    const techSup = suppliers.find(s => s.companyName === 'TechWorld Distributors')?._id || suppliers[0]._id
    const clothSup = suppliers.find(s => s.companyName === 'FashionHub Wholesale')?._id || suppliers[1]._id
    const officeSup = suppliers.find(s => s.companyName === 'OfficeZone Supplies')?._id || suppliers[2]._id

    const productsData = [
      { name: 'Samsung 55" 4K Smart TV', sku: 'SAMSUNG-TV-55', category: elecCat, supplier: techSup, purchasePrice: 32000, sellingPrice: 42999, quantity: 25, minStockLevel: 5 },
      { name: 'Apple iPhone 15 (128GB)', sku: 'APPLE-IP15-128', category: elecCat, supplier: techSup, purchasePrice: 65000, sellingPrice: 79900, quantity: 15, minStockLevel: 3 },
      { name: 'Lenovo ThinkPad X1 Carbon', sku: 'LENOVO-TP-X1', category: elecCat, supplier: techSup, purchasePrice: 85000, sellingPrice: 115000, quantity: 8, minStockLevel: 2 },
      { name: 'Sony WH-1000XM5 Headphones', sku: 'SONY-WH-1000XM5', category: elecCat, supplier: techSup, purchasePrice: 18000, sellingPrice: 24999, quantity: 30, minStockLevel: 10 },
      { name: "Men's Formal Oxford Shirt", sku: 'SHIRT-FORMAL-M-BLU', category: clothCat, supplier: clothSup, purchasePrice: 450, sellingPrice: 999, quantity: 100, minStockLevel: 20 },
      { name: "Women's Floral Anarkali Kurti", sku: 'KURTI-FLORAL-M', category: clothCat, supplier: clothSup, purchasePrice: 350, sellingPrice: 799, quantity: 75, minStockLevel: 15 },
      { name: 'Denim Jeans Slim Fit (32)', sku: 'JEANS-SLIM-32', category: clothCat, supplier: clothSup, purchasePrice: 600, sellingPrice: 1499, quantity: 4, minStockLevel: 10 }, // Low Stock
      { name: 'Office Ergonomic Mesh Chair', sku: 'CHAIR-ERGO-BLK', category: officeCat, supplier: officeSup, purchasePrice: 7000, sellingPrice: 12999, quantity: 12, minStockLevel: 3 },
      { name: 'A4 Copier Paper (500 Sheets)', sku: 'PAPER-A4-500', category: officeCat, supplier: officeSup, purchasePrice: 180, sellingPrice: 350, quantity: 200, minStockLevel: 50 },
      { name: 'Gel Pen Set (10 Pack)', sku: 'PEN-GEL-10PK', category: officeCat, supplier: officeSup, purchasePrice: 80, sellingPrice: 180, quantity: 1, minStockLevel: 25 } // Critical Low Stock
    ]

    for (const p of productsData) {
      const exists = await Product.findOne({ sku: p.sku })
      if (!exists) {
        await Product.create({ ...p, createdBy: admin._id })
      } else {
        exists.quantity = p.quantity
        exists.purchasePrice = p.purchasePrice
        exists.sellingPrice = p.sellingPrice
        exists.minStockLevel = p.minStockLevel
        await exists.save()
      }
    }
    const products = await Product.find()
    console.log(`✅ Products verified (${products.length} total)`)

    // ─── 5. PURCHASES (6 Records) ────────────────────────────────────────────
    await Purchase.deleteMany({}) // Clean existing purchase orders for fresh, reliable testing
    const p1 = products.find(p => p.sku === 'SAMSUNG-TV-55') || products[0]
    const p2 = products.find(p => p.sku === 'APPLE-IP15-128') || products[1]
    const p3 = products.find(p => p.sku === 'SHIRT-FORMAL-M-BLU') || products[4]
    const p4 = products.find(p => p.sku === 'CHAIR-ERGO-BLK') || products[7]
    const p5 = products.find(p => p.sku === 'PAPER-A4-500') || products[8]
    const p6 = products.find(p => p.sku === 'JEANS-SLIM-32') || products[6]

    const purchasesData = [
      {
        purchaseOrderId: 'PO-2026-001',
        supplier: techSup,
        items: [{ product: p1._id, quantity: 5, unitPrice: p1.purchasePrice, totalPrice: p1.purchasePrice * 5 }],
        totalAmount: p1.purchasePrice * 5,
        paymentStatus: 'paid',
        orderStatus: 'received',
        notes: 'Warehouse Bay 1 restocking batch',
        receivedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        createdBy: manager._id
      },
      {
        purchaseOrderId: 'PO-2026-002',
        supplier: techSup,
        items: [{ product: p2._id, quantity: 8, unitPrice: p2.purchasePrice, totalPrice: p2.purchasePrice * 8 }],
        totalAmount: p2.purchasePrice * 8,
        paymentStatus: 'paid',
        orderStatus: 'received',
        notes: 'Urgent mobile shipment - invoice cleared',
        receivedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        createdBy: admin._id
      },
      {
        purchaseOrderId: 'PO-2026-003',
        supplier: clothSup,
        items: [{ product: p3._id, quantity: 40, unitPrice: p3.purchasePrice, totalPrice: p3.purchasePrice * 40 }],
        totalAmount: p3.purchasePrice * 40,
        paymentStatus: 'partial',
        orderStatus: 'ordered',
        notes: 'Seasonal festive stock order',
        expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        createdBy: manager._id
      },
      {
        purchaseOrderId: 'PO-2026-004',
        supplier: officeSup,
        items: [{ product: p4._id, quantity: 4, unitPrice: p4.purchasePrice, totalPrice: p4.purchasePrice * 4 }],
        totalAmount: p4.purchasePrice * 4,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        notes: 'Awaiting vendor quote confirmation',
        createdBy: manager._id
      },
      {
        purchaseOrderId: 'PO-2026-005',
        supplier: officeSup,
        items: [{ product: p5._id, quantity: 50, unitPrice: p5.purchasePrice, totalPrice: p5.purchasePrice * 50 }],
        totalAmount: p5.purchasePrice * 50,
        paymentStatus: 'paid',
        orderStatus: 'received',
        notes: 'Quarterly office supplies replenishment',
        receivedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        createdBy: staff._id
      },
      {
        purchaseOrderId: 'PO-2026-006',
        supplier: clothSup,
        items: [{ product: p6._id, quantity: 15, unitPrice: p6.purchasePrice, totalPrice: p6.purchasePrice * 15 }],
        totalAmount: p6.purchasePrice * 15,
        paymentStatus: 'pending',
        orderStatus: 'cancelled',
        notes: 'Cancelled due to specification mismatch',
        createdBy: manager._id
      }
    ]

    await Purchase.insertMany(purchasesData)
    console.log(`✅ Seeded 6 sample Purchase Orders`)

    // ─── 6. SALES (6 Records) ────────────────────────────────────────────────
    await Sale.deleteMany({}) // Clean existing sales for fresh test analytics
    const salesData = [
      {
        saleId: 'INV-2026-001',
        customer: { name: 'Amit Shah', email: 'amit.shah@gmail.com', phone: '9820012345' },
        items: [{ product: p2._id, quantity: 1, unitPrice: p2.sellingPrice, discount: 0, totalPrice: p2.sellingPrice }],
        subtotal: p2.sellingPrice,
        discount: 0,
        tax: 0,
        totalAmount: p2.sellingPrice,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        notes: 'Walk-in flagship store purchase',
        createdBy: staff._id
      },
      {
        saleId: 'INV-2026-002',
        customer: { name: 'Neha Kapoor', email: 'neha.k@outlook.com', phone: '9819988776' },
        items: [{ product: p1._id, quantity: 1, unitPrice: p1.sellingPrice, discount: 1000, totalPrice: p1.sellingPrice - 1000 }],
        subtotal: p1.sellingPrice,
        discount: 1000,
        tax: 0,
        totalAmount: p1.sellingPrice - 1000,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        notes: 'Card payment processed at terminal 02',
        createdBy: staff._id
      },
      {
        saleId: 'INV-2026-003',
        customer: { name: 'Rahul Sharma', email: 'rahul.s@yahoo.com', phone: '9870054321' },
        items: [
          { product: p3._id, quantity: 3, unitPrice: p3.sellingPrice, discount: 0, totalPrice: p3.sellingPrice * 3 },
          { product: p6._id, quantity: 1, unitPrice: p6.sellingPrice, discount: 0, totalPrice: p6.sellingPrice }
        ],
        subtotal: p3.sellingPrice * 3 + p6.sellingPrice,
        discount: 0,
        tax: 0,
        totalAmount: p3.sellingPrice * 3 + p6.sellingPrice,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        notes: 'Cash invoice receipt handed over',
        createdBy: staff._id
      },
      {
        saleId: 'INV-2026-004',
        customer: { name: 'TechSolutions India', email: 'billing@techsolutions.in', phone: '9920033445' },
        items: [{ product: products[2]._id, quantity: 2, unitPrice: products[2].sellingPrice, discount: 5000, totalPrice: products[2].sellingPrice * 2 - 5000 }],
        subtotal: products[2].sellingPrice * 2,
        discount: 5000,
        tax: 0,
        totalAmount: products[2].sellingPrice * 2 - 5000,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        notes: 'B2B Corporate sale — NEFT verified',
        createdBy: manager._id
      },
      {
        saleId: 'INV-2026-005',
        customer: { name: 'Pooja Verma', email: 'pooja.v@gmail.com', phone: '9845012390' },
        items: [{ product: p5._id, quantity: 10, unitPrice: p5.sellingPrice, discount: 0, totalPrice: p5.sellingPrice * 10 }],
        subtotal: p5.sellingPrice * 10,
        discount: 0,
        tax: 0,
        totalAmount: p5.sellingPrice * 10,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        notes: 'Bulk stationery order',
        createdBy: staff._id
      },
      {
        saleId: 'INV-2026-006',
        customer: { name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '9811122334' },
        items: [{ product: p4._id, quantity: 1, unitPrice: p4.sellingPrice, discount: 0, totalPrice: p4.sellingPrice }],
        subtotal: p4.sellingPrice,
        discount: 0,
        tax: 0,
        totalAmount: p4.sellingPrice,
        paymentMethod: 'upi',
        paymentStatus: 'pending',
        notes: 'Payment link generated — awaiting confirmation',
        createdBy: staff._id
      }
    ]

    await Sale.insertMany(salesData)
    console.log(`✅ Seeded 6 sample Sales Transactions`)

    // ─── 7. INVENTORY TRANSACTIONS (6 Records) ────────────────────────────────
    await InventoryTransaction.deleteMany({})
    const transactionsData = [
      {
        product: p2._id,
        transactionType: 'stock_in',
        quantity: 8,
        previousQuantity: 7,
        newQuantity: 15,
        reference: { type: 'Purchase' },
        reason: 'Restocking shipment received from TechWorld',
        notes: 'Inspection cleared by quality lead',
        createdBy: manager._id
      },
      {
        product: p2._id,
        transactionType: 'sale',
        quantity: 1,
        previousQuantity: 16,
        newQuantity: 15,
        reference: { type: 'Sale' },
        reason: 'Dispatched for Customer Invoice INV-2026-001',
        createdBy: staff._id
      },
      {
        product: products[9]._id, // Gel Pens
        transactionType: 'adjustment',
        quantity: 3,
        previousQuantity: 4,
        newQuantity: 1,
        reference: { type: 'Manual' },
        reason: 'Physical count discrepancy reconciliation',
        notes: '3 units damaged packaging written off',
        createdBy: manager._id
      },
      {
        product: p5._id,
        transactionType: 'stock_in',
        quantity: 50,
        previousQuantity: 150,
        newQuantity: 200,
        reference: { type: 'Purchase' },
        reason: 'Bulk shipment receipt PO-2026-005',
        createdBy: staff._id
      },
      {
        product: p6._id, // Jeans
        transactionType: 'stock_out',
        quantity: 2,
        previousQuantity: 6,
        newQuantity: 4,
        reference: { type: 'Manual' },
        reason: 'Showroom display mannequin allocation',
        createdBy: staff._id
      },
      {
        product: products[2]._id, // ThinkPad
        transactionType: 'sale',
        quantity: 2,
        previousQuantity: 10,
        newQuantity: 8,
        reference: { type: 'Sale' },
        reason: 'Customer sale to TechSolutions India',
        createdBy: manager._id
      }
    ]

    await InventoryTransaction.insertMany(transactionsData)
    console.log(`✅ Seeded 6 Inventory Ledger Transactions`)

    // ─── 8. NOTIFICATIONS (6 Records) ─────────────────────────────────────────
    await Notification.deleteMany({})
    const notificationsData = [
      {
        title: 'Low Stock Warning',
        message: 'Gel Pen Set (10 Pack) has reached critical stock level (1 remaining). Minimum threshold is 25.',
        type: 'low_stock',
        priority: 'high',
        isRead: false,
        createdBy: admin._id
      },
      {
        title: 'Stock Depletion Alert',
        message: 'Denim Jeans Slim Fit (32) is running low: only 4 units left in main warehouse.',
        type: 'low_stock',
        priority: 'high',
        isRead: false,
        createdBy: admin._id
      },
      {
        title: 'High-Value Sale Confirmed',
        message: 'Order INV-2026-004 completed for ₹2,25,000 via NEFT Bank Transfer.',
        type: 'new_sale',
        priority: 'medium',
        isRead: false,
        createdBy: manager._id
      },
      {
        title: 'Procurement Order Delivered',
        message: 'PO-2026-002 from TechWorld Distributors arrived and checked into inventory.',
        type: 'new_purchase',
        priority: 'low',
        isRead: true,
        readAt: new Date(),
        createdBy: manager._id
      },
      {
        title: 'New Retail Sale Recorded',
        message: 'Counter invoice INV-2026-001 for Apple iPhone 15 completed by Ananya Roy.',
        type: 'new_sale',
        priority: 'medium',
        isRead: false,
        createdBy: staff._id
      },
      {
        title: 'System Health Check',
        message: 'Automated warehouse inventory snapshot synchronized with central MongoDB Atlas database.',
        type: 'system',
        priority: 'low',
        isRead: true,
        readAt: new Date(),
        createdBy: admin._id
      }
    ]

    await Notification.insertMany(notificationsData)
    console.log(`✅ Seeded 6 Live System Notifications\n`)

    console.log('═════════════════════════════════════════════════════════════════')
    console.log('🎉 ALL DATA SEEDED SUCCESSFULLY FOR ROLE-BASED TESTING!')
    console.log('═════════════════════════════════════════════════════════════════')
    console.log('👑 ADMIN LOGIN:')
    console.log('   Email:    admin@inventory.com')
    console.log('   Password: Admin@123')
    console.log('   Access:   Full permissions (User Management, Delete, Add, Edit, Reports)\n')
    console.log('👔 MANAGER LOGINS:')
    console.log('   Email:    manager@inventory.com')
    console.log('   Password: Manager@123')
    console.log('   Email:    rohit.manager@inventory.com')
    console.log('   Password: Manager@123')
    console.log('   Access:   Products, Inventory Adjustments, Purchases, Sales, Reports\n')
    console.log('🧑‍💻 STAFF LOGINS:')
    console.log('   Email:    staff@inventory.com')
    console.log('   Password: Staff@123')
    console.log('   Email:    ananya.staff@inventory.com')
    console.log('   Password: Staff@123')
    console.log('   Email:    karan.staff@inventory.com')
    console.log('   Password: Staff@123')
    console.log('   Access:   View Inventory, Create Sales, Stock In/Out, Profile\n')
    console.log('📊 TEST DATA LOADED:')
    console.log('   - 6 Users with distinct roles')
    console.log('   - 5 Product Categories')
    console.log('   - 3 Suppliers')
    console.log('   - 10 Products (with high stock, low stock, and critical alerts)')
    console.log('   - 6 Purchase Orders (Received, Ordered, Pending, Cancelled)')
    console.log('   - 6 Sales Invoices (UPI, Card, Cash, Bank Transfer)')
    console.log('   - 6 Inventory Stock Audit Ledger Records')
    console.log('   - 6 System & Alert Notifications')
    console.log('═════════════════════════════════════════════════════════════════\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedAll()
