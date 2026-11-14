# 🎓 Comprehensive Viva Voce Questions & Answers Guide

> **Audience**: College Engineering Students facing External Faculty Evaluators  
> **Format**: Question $\rightarrow$ Simple, Direct Answer $\rightarrow$ Exact Code Reference in Project

---

## 1. React & Modern Frontend

**Q1: What is a Single Page Application (SPA), and how does React implement it?**
> **Answer**: In an SPA, the browser loads a single HTML file (`index.html`). When the user clicks navigation links, JavaScript updates the DOM dynamically without making a full-page reload to the web server. In our project, `react-router-dom` handles URL matching and renders the corresponding page component (`<Dashboard />`, `<Products />`, etc.) instantly.

**Q2: What is the Virtual DOM and why is it faster?**
> **Answer**: The Virtual DOM is a lightweight in-memory representation of the real browser DOM. When component state changes, React updates the Virtual DOM, calculates the minimal differences via a "reconciliation" diffing algorithm, and efficiently updates only the changed DOM nodes instead of re-rendering the whole page.

**Q3: Explain the difference between `useState` and `useEffect`.**
> **Answer**:
> - `useState`: Stores local component state that causes a re-render when modified (e.g. `const [search, setSearch] = useState('')`).
> - `useEffect`: Executes side-effects after rendering, such as fetching data from our backend REST API on component mount or setting up timers.

---

## 2. Tailwind CSS

**Q4: Why use Tailwind CSS over standard CSS or Bootstrap?**
> **Answer**: Tailwind is utility-first. Instead of writing custom CSS classes in external files or using rigid pre-styled Bootstrap components, we build custom, responsive designs directly in our TSX markup using utility classes (`flex`, `bg-blue-600`, `rounded-2xl`, `shadow-sm`). Tailwind also purges unused styles during `npm run build`, producing an ultra-light stylesheet (~24KB in our project).

---

## 3. Redux Toolkit (State Management)

**Q5: What problem does Redux solve in your project?**
> **Answer**: Without Redux, passing data (like the logged-in user profile, unread notification count, or cart items) between distant components requires cumbersome "prop drilling" through many intermediate layers. Redux provides a centralized global store accessible by any component via `useAppSelector` and modifiable via `useAppDispatch`.

**Q6: What is a "Slice" in Redux Toolkit?**
> **Answer**: A slice bundles the initial state, synchronous reducer functions, and asynchronous thunk actions for a specific domain feature. Our application has 9 slices: `auth`, `products`, `categories`, `suppliers`, `inventory`, `purchases`, `sales`, `dashboard`, `notifications`.

**Q7: What is `createAsyncThunk`?**
> **Answer**: It is a Redux Toolkit utility that simplifies asynchronous API calls. It automatically dispatches three lifecycle actions: `pending` (to show loading spinners), `fulfilled` (to store API response data), and `rejected` (to display error messages).

---

## 4. Node.js & Express.js

**Q8: What is Node.js and how does its event-driven non-blocking I/O work?**
> **Answer**: Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine. It uses a single-threaded Event Loop that delegates time-consuming tasks (like database queries or file reading) to the operating system kernel and processes callbacks when complete, allowing it to handle thousands of concurrent client connections without freezing.

**Q9: What is Express.js?**
> **Answer**: Express is a minimalist, fast web framework for Node.js. It provides robust routing, HTTP request/response helpers, and a middleware architecture for building REST APIs.

---

## 5. REST APIs & HTTP

**Q10: What makes an API "RESTful"?**
> **Answer**: REST (Representational State Transfer) uses standard HTTP methods mapped to CRUD operations:
> - `GET`: Read / retrieve resources.
> - `POST`: Create new resources.
> - `PUT` / `PATCH`: Update existing resources.
> - `DELETE`: Remove resources.
> It uses standard status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`).

---

## 6. MongoDB & Mongoose

**Q11: Why NoSQL MongoDB instead of relational MySQL for an inventory system?**
> **Answer**: Sales orders and purchase orders have variable-length nested line items (`items: [{ product, quantity, unitPrice }]`). In SQL, this requires 3 tables and complex multi-table `JOIN` statements. In MongoDB, line items can be modeled directly as subdocuments. MongoDB also offers flexible document evolution as product attributes change.

**Q12: What does `populate()` do in Mongoose?**
> **Answer**: Mongoose documents store references to other documents as `ObjectId` values. `populate()` instructs Mongoose to automatically query the referenced collection and substitute the `ObjectId` with the full document data (similar to a SQL `LEFT JOIN`).
> *Example*: `Purchase.findById(id).populate('supplier', 'name companyName email')`.

---

## 7. Authentication, JWT & Security

**Q13: How does JWT authentication work and why is it stateless?**
> **Answer**: When a user logs in, the server verifies their credentials and issues a cryptographically signed token containing their `userId`. The client stores this in `localStorage` and includes it in the `Authorization: Bearer <token>` header of subsequent requests. The server verifies the token signature mathematically using the `JWT_SECRET` without needing a server-side session store in memory.

**Q14: Why do we hash passwords with bcrypt instead of storing them plain or with MD5?**
> **Answer**: Plaintext passwords are catastrophic if the database is leaked. Fast algorithms like MD5 or SHA256 can be cracked in seconds using precomputed "rainbow tables". `bcrypt` incorporates a random "salt" (10 rounds in our project) and is computationally slow by design, making brute-force and rainbow table attacks infeasible.

**Q15: What is the difference between Authentication and Authorization?**
> **Answer**:
> - **Authentication (401 Unauthorized)**: Verifying *who you are* (verifying login email and password, validating JWT token).
> - **Authorization (403 Forbidden)**: Verifying *what you have permission to do* (checking if user role is `admin` before permitting user role changes or product deletion).

---

## 8. Real-Time WebSockets (Socket.IO)

**Q16: Why use WebSockets / Socket.IO instead of HTTP polling?**
> **Answer**: HTTP is request-response: the client must constantly send requests (`GET /api/inventory` every 2 seconds) to check for updates, wasting CPU, network bandwidth, and creating latency. WebSockets establish a single persistent, bi-directional TCP connection where the server pushes updates to the client in milliseconds as soon as an event occurs.

**Q17: How is Socket.IO authenticated in your project?**
> **Answer**: During the initial WebSocket handshake, the client passes `{ auth: { token } }`. In `backend/sockets/socketHandler.js`, middleware verifies the JWT token with `jwt.verify()`. Only valid authenticated users can open a socket connection and join user/role rooms.

---

## 9. Docker & Containerization

**Q18: What is the difference between a Virtual Machine (VM) and a Docker Container?**
> **Answer**: A VM virtualizes hardware and boots an entire guest operating system (several gigabytes, takes minutes to boot). A Docker container shares the host OS kernel and packages only application code and dependencies (megabytes, boots in seconds).

**Q19: Explain your multi-stage Dockerfile for the frontend.**
> **Answer**: In `frontend/Dockerfile`, Stage 1 uses `node:20-alpine` to compile TypeScript and Tailwind into static HTML/CSS/JS files (`dist/`). Stage 2 copies only that compiled output into a tiny `nginx:alpine` image (~25MB). This keeps the production container ultra-lightweight and eliminates Node runtime attack surfaces.

---

## 10. DevOps & CI/CD

**Q20: What is CI/CD and what checks does your GitHub Actions workflow perform?**
> **Answer**: CI/CD automates integration and delivery. In `.github/workflows/ci.yml`, whenever code is pushed:
> 1. It spins up an Ubuntu VM with a live MongoDB service.
> 2. Runs backend syntax checks (`node -c index.js`) and automated unit tests.
> 3. Runs frontend production build (`npm run build`) to catch TypeScript errors.
> 4. Validates Docker Compose configuration (`docker compose config`).

---

## 11. Core Business Logic

**Q21: Walk through what happens when a purchase order is created vs. received.**
> **Answer**:
> - When created: A purchase document is saved with status `pending`. **Warehouse stock does not change** because goods have not physically arrived.
> - When received (`PATCH /api/purchases/:id/receive`): The backend verifies the order is not already received (preventing double counting), increments the quantity of every item in `Product`, creates `InventoryTransaction` records with type `purchase`, marks the order as `received`, and emits a `newPurchase` Socket.IO alert.

**Q22: How does the system handle an attempt to sell more items than available in stock?**
> **Answer**: In `backend/controllers/saleController.js`, a pre-validation loop inspects every requested product in the cart against current database stock before deducting anything. If requested quantity exceeds available inventory, the request is aborted with `400 Bad Request: Insufficient stock for "<ProductName>"` and zero changes occur.
