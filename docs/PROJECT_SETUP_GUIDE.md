# 🚀 Smart Inventory Management System — Step-by-Step Setup Guide

> **Audience**: College Engineering Students & Faculty Evaluators  
> **Platform**: Windows 10/11 with VS Code & PowerShell

---

## 📌 1. Which Folder to Open in VS Code

Always open the **inner project folder**:
`C:\Users\ankit\OneDrive\Desktop\FSD_PROJECT\inventory-management`

> ⚠️ **Common Mistake**: Do **NOT** open the parent folder `FSD_PROJECT`. If you open `FSD_PROJECT`, your terminal path will be one folder higher, and commands like `npm run dev` will fail with `package.json not found`.

---

## 💻 2. Verifying Prerequisites on Windows

Open **Windows PowerShell** (or VS Code integrated terminal `Ctrl + ~`):

### A. Check Node.js
```powershell
node -v
```
- **Expected Output**: `v18.x`, `v20.x`, or `v24.x` (Your machine has `v24.13.0` installed ✅)
- **What it means**: The Node.js JavaScript runtime is installed and ready.

### B. Check npm (Node Package Manager)
```powershell
npm -v
```
- **Expected Output**: `9.x`, `10.x`, or `11.x` (Your machine has `11.6.2` installed ✅)

### C. Check Git
```powershell
git --version
```
- **Expected Output**: `git version 2.x` (Your machine has `2.51.0` installed ✅)

### D. Check Docker (Optional, for containerized run)
```powershell
docker --version
```
- **Expected Output**: `Docker version 20.x` or `29.x` (Installed ✅)

---

## 🍃 3. MongoDB Database Configuration (2 Options)

The backend needs a MongoDB connection URL (`MONGODB_URI`). Choose **Option A (MongoDB Atlas Cloud)** or **Option B (Docker Container)**.

### Option A: MongoDB Atlas Cloud (Recommended — 100% Free, No Local Install)
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in (or create a free account).
2. Click **Create a Deployment** $\rightarrow$ select the **M0 FREE** tier.
3. In **Security Quickstart**:
   - Create a database user (e.g., username: `inventoryAdmin`, password: a secure password).
   - In **IP Access List**, click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Connect** $\rightarrow$ **Drivers** (Node.js).
5. Copy your connection string, which looks like:
   ```
   mongodb+srv://inventoryAdmin:<password>@cluster0.abcde.mongodb.net/inventory_db?retryWrites=true&w=majority
   ```
6. Open `backend/.env` and paste your string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://inventoryAdmin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/inventory_db?retryWrites=true&w=majority
   JWT_SECRET=super_secure_dev_jwt_secret_smart_inventory_2026_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

### Option B: Local MongoDB via Docker
If you have Docker Desktop running:
```powershell
cd inventory-management
docker compose up -d mongodb
```
This runs MongoDB 6.0 in the background on `localhost:27017`. Your `backend/.env` can remain:
```env
MONGODB_URI=mongodb://localhost:27017/inventory_db
```

---

## 🌱 4. Seeding the Database with Initial Data

Once your MongoDB connection is configured in `backend/.env`, populate the test users, categories, suppliers, and products:

```powershell
# Open terminal inside the backend directory:
cd C:\Users\ankit\OneDrive\Desktop\FSD_PROJECT\inventory-management\backend

# Execute the seed script:
npm run seed
```

### Expected Output:
```
MongoDB Connected: ...
🌱 Starting seed...
✅ Users seeded
✅ Categories seeded
✅ Suppliers seeded
✅ Products seeded

🎉 Seed completed successfully!

📋 Test Credentials:
   Admin:   admin@inventory.com   / Admin@123
   Manager: manager@inventory.com / Manager@123
   Staff:   staff@inventory.com   / Staff@123
```

---

## 🏃 5. Starting the Project (Two Terminals)

### Terminal 1 — Backend API Server
1. In VS Code, open a PowerShell terminal (`Ctrl + Shift + \``).
2. Run:
```powershell
cd C:\Users\ankit\OneDrive\Desktop\FSD_PROJECT\inventory-management\backend
npm run dev
```
- **What this command does**: Runs `nodemon index.js` which starts the Express REST server on port 5000 and automatically reloads if you edit any backend file.
- **Expected Terminal Output**:
  ```
  [nodemon] starting `node index.js`
  MongoDB Connected: ...
  Server running on port 5000
  ```

---

### Terminal 2 — Frontend React App
1. In VS Code, click the **`+`** icon on the top-right of the terminal panel to open a **Second Terminal**.
2. Run:
```powershell
cd C:\Users\ankit\OneDrive\Desktop\FSD_PROJECT\inventory-management\frontend
npm run dev
```
- **What this command does**: Starts the Vite development server on port 5173.
- **Expected Terminal Output**:
  ```
    VITE v8.3.8  ready in 250 ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
  ```

---

## 🌐 6. Opening & Testing the Application

1. Open your browser (Chrome / Edge / Firefox) and visit:
   ```
   http://localhost:5173
   ```
2. You will be greeted by the **Smart Inventory Login** screen.
3. Log in with:
   - **Email**: `admin@inventory.com`
   - **Password**: `Admin@123`
4. The **Live Dashboard** will load with live statistics, monthly revenue graphs, low-stock warnings, and transaction cards.

---

## 🛑 7. How to Stop the Servers Safely

- To stop the backend or frontend: Click in the respective terminal window and press **`Ctrl + C`**, then type **`Y`** and hit **Enter**.
- To stop Docker containers (if using Docker):
  ```powershell
  docker compose down
  ```

---

## ⚠️ 8. Common Troubleshooting & Quick Fixes

| Issue | Cause | Quick Solution |
|---|---|---|
| `Cannot find module 'express'` | Run from wrong folder | Make sure terminal is in `inventory-management/backend` |
| `EADDRINUSE: port 5000 already in use` | Old Node process still running | Run in PowerShell: `Stop-Process -Name node -Force` |
| `MongoNetworkError` | MongoDB not running or invalid URI | Check connection string in `backend/.env` |
| `Vite port 5173 busy` | Another Vite instance open | Stop previous terminal or visit the alternate port printed by Vite (e.g. 5174) |
