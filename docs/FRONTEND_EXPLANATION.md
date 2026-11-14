# ⚛️ React 19 & Redux Toolkit Frontend Architecture Guide

> **Project**: Smart Inventory Management System  
> **Frontend Stack**: React 19 + TypeScript + Redux Toolkit + React Router v7 + Tailwind CSS + Lucide Icons + Recharts

---

## 💡 1. Core Frontend Concepts Explained Simply

- **React**: A component-based JavaScript library for building interactive user interfaces. Instead of reloading the browser for every page change, React renders Single Page Applications (SPAs) dynamically.
- **TypeScript (TSX)**: JavaScript with strict static types. It catches bugs like `undefined` property errors or typo errors during code editing rather than at customer runtime.
- **Components**: Reusable, independent UI building blocks (e.g., `<Button />`, `<Sidebar />`, `<Table />`).
- **Props (Properties)**: Inputs passed from a parent component down to a child component (like arguments to a function).
- **State**: Data stored inside a component that changes over time (e.g., user input in a text box, active modal flag). When state updates, React re-renders the component.
- **Hooks**: Special functions starting with `use` that let components access state and lifecycle features:
  - `useState`: Manages local variable state.
  - `useEffect`: Executes side-effects like fetching data from an API when a component loads.
  - `useAppSelector`: Reads state from the global Redux store.
  - `useAppDispatch`: Sends actions to the Redux store to trigger state changes.
- **Tailwind CSS**: A utility-first CSS framework. Rather than writing separate `.css` files, classes like `flex`, `bg-blue-600`, `rounded-xl`, `shadow-sm` are composed directly on HTML elements.

---

## 🗺️ 2. Component Hierarchy & Routing Tree

```
<main.tsx> (Redux Provider + BrowserRouter)
   │
   └── <App.tsx> (Route Registry)
         │
         ├── Public Routes:
         │     ├── /login    ──> <Login.tsx>
         │     └── /register ──> <Register.tsx>
         │
         └── Protected Routes: (<ProtectedRoute>)
               └── <DashboardLayout>
                     ├── <Sidebar /> (Collapsible Navigation)
                     ├── <Navbar /> (User Avatar, Notifications)
                     └── Page Outlet:
                           ├── /dashboard        ──> <Dashboard.tsx>
                           ├── /products         ──> <Products.tsx>
                           ├── /products/add     ──> <AddProduct.tsx>
                           ├── /products/:id     ──> <ProductDetail.tsx>
                           ├── /categories       ──> <Categories.tsx>
                           ├── /suppliers        ──> <Suppliers.tsx>
                           ├── /inventory        ──> <Inventory.tsx>
                           ├── /purchases        ──> <Purchases.tsx>
                           ├── /purchases/add    ──> <AddPurchase.tsx>
                           ├── /purchases/:id    ──> <PurchaseDetail.tsx>
                           ├── /sales            ──> <Sales.tsx>
                           ├── /sales/add        ──> <AddSale.tsx>
                           ├── /sales/:id        ──> <SaleDetail.tsx>
                           ├── /reports          ──> <Reports.tsx>
                           ├── /notifications    ──> <Notifications.tsx>
                           └── /users (Admin)    ──> <UserManagement.tsx>
```

---

## 🗃️ 3. Redux Toolkit Global State Architecture

Our application uses **9 distinct slices** to manage global application state:

```
Redux Store (store.ts)
 ├── auth          ──> Current logged-in user, JWT token, isAuthenticated
 ├── dashboard     ──> KPI metrics, 6-month sales/purchase charts, low-stock lists
 ├── products      ──> Product catalog list, pagination, single product details
 ├── categories    ──> Product categories list and creation state
 ├── suppliers     ──> Vendor contacts and company list
 ├── inventory     ──> Transaction logs, stock movement history
 ├── purchases     ──> Purchase orders list, receiving state
 ├── sales         ──> Sales transactions, customer receipts
 └── notifications ──> In-app alerts, unread counter badge
```

### How Data Flows in Redux:
1. User clicks **"Receive Order"** on the UI.
2. The component calls `dispatch(receivePurchase({ id }))`.
3. Redux runs the `createAsyncThunk` action which calls `api.put('/purchases/' + id + '/receive')`.
4. While the HTTP request is pending, Redux sets `isLoading = true` (shows spinner).
5. When the backend responds with `200 OK`, Redux runs the `fulfilled` reducer, updates the store with the new stock count, and sets `isLoading = false`.
6. React detects the store change and instantly re-renders the table with updated data.

---

## 📱 4. Key Frontend Pages & What They Do

### 1. `Dashboard.tsx`
- **Purpose**: Executive overview of business health.
- **Components**: Recharts `<AreaChart />` for sales revenue, `<BarChart />` for procurement expenses, metric cards (`StatsCard`), low-stock alert table.
- **Redux Slice**: `dashboardSlice`.

### 2. `Products.tsx`
- **Purpose**: Complete inventory item catalog.
- **Features**: Live search bar, category dropdown filter, stock level filter (In Stock, Low Stock, Out of Stock), pagination, Add Product modal, Delete confirmation modal.
- **Redux Slice**: `productSlice`.

### 3. `Inventory.tsx`
- **Purpose**: Physical warehouse movement and reconciliation.
- **Features**: Dual-mode tabs:
  1. *Stock Overview*: Visual product cards with instant **Stock In (+)**, **Stock Out (-)**, and **Adjust** action buttons.
  2. *Transaction History*: Full audit table tracking balance before and after each movement with operator name.
- **Redux Slice**: `inventorySlice`.

### 4. `Purchases.tsx` & `AddPurchase.tsx`
- **Purpose**: Procurement tracking.
- **Crucial Rule**: Adding items to a purchase order does **not** alter stock until marked **"Received"**. This prevents fraudulent or premature stock additions.
- **Redux Slice**: `purchaseSlice`.

### 5. `Sales.tsx`, `AddSale.tsx` & `SaleDetail.tsx`
- **Purpose**: Point of Sale billing.
- **Features**: Validates item availability in real-time. Automatically deducts stock upon submission. Generates a printable Tax Invoice with customer name, payment mode, GST taxes, and totals.
- **Redux Slice**: `saleSlice`.

### 6. `Reports.tsx`
- **Purpose**: Management audits and accounting.
- **Features**: Date range pickers (`startDate`, `endDate`), dynamic metric calculations, and **one-click Export to CSV** for spreadsheets.
- **API Source**: `reportController.js`.

### 7. `Notifications.tsx`
- **Purpose**: Real-time notification center.
- **Features**: Color-coded badges for Out of Stock (Red), Low Stock (Amber), and New Sale (Green). Mark single item as read or "Mark All as Read".
- **Redux Slice**: `notificationSlice`.

### 8. `UserManagement.tsx`
- **Purpose**: Admin-only staff permission dashboard.
- **Features**: View registered personnel, change roles (`admin`, `manager`, `staff`), and remove accounts with protected safety checks (cannot delete own account).
