# 📡 REST API Reference & Specification

> **Base URL**: `http://localhost:5000/api`  
> **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`

---

## 📋 Standard Response Structure

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Error Response (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` / `409 Conflict`)
```json
{
  "success": false,
  "message": "Insufficient stock for product. Available: 4, Requested: 10",
  "errors": null
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new staff account |
| `POST` | `/api/auth/login` | Public | Authenticate and retrieve JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user profile |
| `POST` | `/api/auth/logout` | Private | Stateless logout confirmation |

#### Sample Login Request:
```json
POST /api/auth/login
{
  "email": "admin@inventory.com",
  "password": "Admin@123"
}
```

---

## 2. Dashboard & Analytics (`/api/dashboard`)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Private | Aggregated KPIs (inventory valuation, total products, monthly revenue, alert counts) |
| `GET` | `/api/dashboard/sales-chart` | Private | 6-month monthly sales revenue aggregation |
| `GET` | `/api/dashboard/purchase-chart`| Private | 6-month monthly procurement expenditure aggregation |
| `GET` | `/api/dashboard/low-stock` | Private | Top 10 products requiring urgent reorder |
| `GET` | `/api/dashboard/recent-sales` | Private | 5 most recent sales transactions |
| `GET` | `/api/dashboard/recent-purchases`| Private | 5 most recent purchase orders |

---

## 3. Product Catalog Endpoints (`/api/products`)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/products` | Private | Paginated list (supports `search`, `category`, `status`, `page`, `limit`) |
| `GET` | `/api/products/:id` | Private | Detailed product specification with populated Category & Supplier |
| `POST` | `/api/products` | Admin, Manager | Create catalog item with SKU and pricing |
| `PUT` | `/api/products/:id` | Admin, Manager | Update product attributes and thresholds |
| `DELETE` | `/api/products/:id` | Admin | Remove product item |
| `GET` | `/api/products/low-stock`| Private | List all items with `quantity <= minStockLevel` |

---

## 4. Inventory Control Endpoints (`/api/inventory`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/inventory/stock-in` | Admin, Manager | Increases product quantity; logs `stock_in` transaction; emits WebSocket event |
| `POST` | `/api/inventory/stock-out` | Admin, Manager | Decreases product quantity (validates stock); logs `stock_out` transaction |
| `POST` | `/api/inventory/adjustment`| Admin, Manager | Sets exact physical count; logs reconciliation transaction |
| `GET` | `/api/inventory/transactions` | Private | Paginated immutable audit trail with operator references |

#### Sample Stock In Request:
```json
POST /api/inventory/stock-in
{
  "productId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "quantity": 25,
  "reason": "Received vendor pallet shipment",
  "notes": "Gate Delivery Note #GN-8921"
}
```

---

## 5. Purchase Order Endpoints (`/api/purchases`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/purchases` | Private | Paginated procurement list |
| `GET` | `/api/purchases/:id` | Private | Detailed PO with line items breakdown |
| `POST` | `/api/purchases` | Admin, Manager | Creates PO (Does **NOT** increase stock) |
| `PUT` | `/api/purchases/:id` | Admin, Manager | Updates pending PO items or delivery date |
| `PATCH/PUT`| `/api/purchases/:id/receive`| Admin, Manager | **Marks as received $\rightarrow$ Automatically increases warehouse stock** |
| `PATCH/PUT`| `/api/purchases/:id/cancel` | Admin, Manager | Cancels an unreceived order |

---

## 6. Point of Sale Endpoints (`/api/sales`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/sales` | Private | Paginated sales transactions |
| `GET` | `/api/sales/:id` | Private | Detailed invoice record |
| `POST` | `/api/sales` | Private (All roles)| Validates stock, deducts inventory, generates invoice, emits `newSale` socket |

#### Sample Create Sale Request:
```json
POST /api/sales
{
  "customer": {
    "name": "Arun Verma",
    "phone": "+91 9876543210",
    "email": "arun@example.com"
  },
  "items": [
    {
      "product": "65f1a2b3c4d5e6f7a8b9c0d1",
      "quantity": 2,
      "unitPrice": 1899
    }
  ],
  "discount": 100,
  "tax": 90,
  "paymentMethod": "upi",
  "notes": "Promotional launch discount applied"
}
```

---

## 7. Reports & Audits (`/api/reports`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/inventory` | Private | Catalog-wide inventory valuation (`quantity * purchasePrice`) |
| `GET` | `/api/reports/sales` | Private | Sales turnover ledger with date range filters (`startDate`, `endDate`) |
| `GET` | `/api/reports/purchases`| Private | Procurement expenses breakdown with date filters |

---

## 8. User Management (`/api/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin Only | Lists all registered staff members |
| `PATCH/PUT`| `/api/users/:id/role` | Admin Only | Promotes/demotes user (`admin`, `manager`, `staff`) |
| `DELETE` | `/api/users/:id` | Admin Only | Deletes account (cannot delete own account) |
| `PATCH/PUT`| `/api/users/profile` | Private | Update own name and email |
| `PATCH/PUT`| `/api/users/change-password` | Private | Verify old password and set new password |
