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

const connectDB = require('../config/db')

const seed = async () => {
  try {
    await connectDB()
    console.log('🌱 Starting seed...')

    // ─── USERS ───────────────────────────────────────────────────────────────
    const usersData = [
      { name: 'Admin User', email: 'admin@inventory.com', password: 'Admin@123', role: 'admin' },
      { name: 'Manager User', email: 'manager@inventory.com', password: 'Manager@123', role: 'manager' },
      { name: 'Staff User', email: 'staff@inventory.com', password: 'Staff@123', role: 'staff' }
    ]

    let adminUser = await User.findOne({ email: 'admin@inventory.com' })
    if (!adminUser) {
      for (const u of usersData) {
        await User.create(u)
      }
      adminUser = await User.findOne({ email: 'admin@inventory.com' })
      console.log('✅ Users seeded with bcrypt hashed passwords')
    } else {
      console.log('⏭  Users already exist, skipping')
    }

    // ─── CATEGORIES ──────────────────────────────────────────────────────────
    const categoriesData = [
      { name: 'Electronics', description: 'Electronic devices and accessories', color: '#3B82F6', icon: 'cpu' },
      { name: 'Clothing', description: 'Apparel and fashion items', color: '#EC4899', icon: 'shirt' },
      { name: 'Food & Beverages', description: 'Consumable food and drink products', color: '#F59E0B', icon: 'coffee' },
      { name: 'Office Supplies', description: 'Stationery and office equipment', color: '#10B981', icon: 'briefcase' },
      { name: 'Furniture', description: 'Home and office furniture', color: '#8B5CF6', icon: 'home' }
    ]

    const existingCategories = await Category.countDocuments()
    let categories = []
    if (existingCategories === 0) {
      categories = await Category.insertMany(
        categoriesData.map((c) => ({ ...c, createdBy: adminUser._id }))
      )
      console.log('✅ Categories seeded')
    } else {
      categories = await Category.find()
      console.log('⏭  Categories already exist, skipping')
    }

    // ─── SUPPLIERS ───────────────────────────────────────────────────────────
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

    const existingSuppliers = await Supplier.countDocuments()
    let suppliers = []
    if (existingSuppliers === 0) {
      suppliers = await Supplier.insertMany(
        suppliersData.map((s) => ({ ...s, createdBy: adminUser._id }))
      )
      console.log('✅ Suppliers seeded')
    } else {
      suppliers = await Supplier.find()
      console.log('⏭  Suppliers already exist, skipping')
    }

    // ─── PRODUCTS ────────────────────────────────────────────────────────────
    const electronicsCat = categories.find((c) => c.name === 'Electronics')
    const clothingCat = categories.find((c) => c.name === 'Clothing')
    const officeCat = categories.find((c) => c.name === 'Office Supplies')

    const techSupplier = suppliers.find((s) => s.email === 'ravi@techworld.com') || suppliers[0]
    const fashionSupplier = suppliers.find((s) => s.email === 'priya@fashionhub.com') || suppliers[1]
    const officeSupplier = suppliers.find((s) => s.email === 'suresh@officezone.com') || suppliers[2]

    const productsData = [
      {
        name: 'Samsung 55" 4K Smart TV',
        sku: 'SAMSUNG-TV-55',
        description: 'Ultra HD 4K Smart Television with HDR support',
        category: electronicsCat?._id,
        supplier: techSupplier._id,
        purchasePrice: 32000,
        sellingPrice: 42999,
        quantity: 25,
        minStockLevel: 5
      },
      {
        name: 'Apple iPhone 15',
        sku: 'APPLE-IP15-128',
        description: 'Apple iPhone 15 - 128GB - Black',
        category: electronicsCat?._id,
        supplier: techSupplier._id,
        purchasePrice: 65000,
        sellingPrice: 79900,
        quantity: 15,
        minStockLevel: 3
      },
      {
        name: 'Lenovo ThinkPad X1',
        sku: 'LENOVO-TP-X1',
        description: 'Business ultrabook with Intel i7, 16GB RAM, 512GB SSD',
        category: electronicsCat?._id,
        supplier: techSupplier._id,
        purchasePrice: 85000,
        sellingPrice: 115000,
        quantity: 8,
        minStockLevel: 2
      },
      {
        name: 'Sony Wireless Headphones',
        sku: 'SONY-WH-1000XM5',
        description: 'Industry-leading noise cancelling wireless headphones',
        category: electronicsCat?._id,
        supplier: techSupplier._id,
        purchasePrice: 18000,
        sellingPrice: 24999,
        quantity: 30,
        minStockLevel: 10
      },
      {
        name: "Men's Formal Shirt",
        sku: 'SHIRT-FORMAL-M-BLU',
        description: 'Premium formal shirt in classic blue - Medium',
        category: clothingCat?._id,
        supplier: fashionSupplier._id,
        purchasePrice: 450,
        sellingPrice: 999,
        quantity: 100,
        minStockLevel: 20
      },
      {
        name: "Women's Kurti - Floral",
        sku: 'KURTI-FLORAL-M',
        description: 'Elegant floral print kurti for women - Medium',
        category: clothingCat?._id,
        supplier: fashionSupplier._id,
        purchasePrice: 350,
        sellingPrice: 799,
        quantity: 75,
        minStockLevel: 15
      },
      {
        name: 'Denim Jeans - Slim Fit',
        sku: 'JEANS-SLIM-32',
        description: 'Classic slim fit denim jeans - Waist 32',
        category: clothingCat?._id,
        supplier: fashionSupplier._id,
        purchasePrice: 600,
        sellingPrice: 1499,
        quantity: 5,
        minStockLevel: 10
      },
      {
        name: 'Office Chair - Ergonomic',
        sku: 'CHAIR-ERGO-BLK',
        description: 'High-back ergonomic office chair with lumbar support',
        category: officeCat?._id,
        supplier: officeSupplier._id,
        purchasePrice: 7000,
        sellingPrice: 12999,
        quantity: 12,
        minStockLevel: 3
      },
      {
        name: 'A4 Paper Ream - 500 Sheets',
        sku: 'PAPER-A4-500',
        description: '80 GSM premium A4 copy paper - 500 sheets',
        category: officeCat?._id,
        supplier: officeSupplier._id,
        purchasePrice: 180,
        sellingPrice: 350,
        quantity: 200,
        minStockLevel: 50
      },
      {
        name: 'Gel Pen Set - 10 Pack',
        sku: 'PEN-GEL-10PK',
        description: 'Smooth writing gel pens in assorted colors - pack of 10',
        category: officeCat?._id,
        supplier: officeSupplier._id,
        purchasePrice: 80,
        sellingPrice: 180,
        quantity: 2,
        minStockLevel: 25
      }
    ]

    const existingProducts = await Product.countDocuments()
    if (existingProducts === 0) {
      await Product.insertMany(
        productsData.map((p) => ({ ...p, createdBy: adminUser._id }))
      )
      console.log('✅ Products seeded')
    } else {
      console.log('⏭  Products already exist, skipping')
    }

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📋 Test Credentials:')
    console.log('   Admin:   admin@inventory.com   / Admin@123')
    console.log('   Manager: manager@inventory.com / Manager@123')
    console.log('   Staff:   staff@inventory.com   / Staff@123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seed()
