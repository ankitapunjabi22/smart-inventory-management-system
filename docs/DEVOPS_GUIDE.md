# 🔄 DevOps, CI/CD & GitHub Actions Automation Guide

> **Project**: Smart Inventory Management System  
> **Automation Stack**: Git + GitHub + GitHub Actions Workflows + CI/CD Testing

---

## 💡 1. DevOps Concepts Explained Simply

- **DevOps**: A combination of **Development** (writing code) and **Operations** (testing, building, deploying, monitoring). It automates the software delivery lifecycle so code goes from your editor to production safely and reliably.
- **CI (Continuous Integration)**: The practice of automatically building and testing code every time a developer commits or creates a pull request. If a bug or syntax error is introduced, the CI server immediately rejects the commit.
- **CD (Continuous Delivery / Deployment)**: The automated process of packaging and deploying validated code to cloud servers (e.g., Render, Vercel, AWS).
- **Git**: A distributed version control tool that records file changes over time.
- **GitHub**: A cloud platform for hosting Git repositories, reviewing code, and running automation workflows.
- **Commit**: A permanent snapshot of code changes with a descriptive message.
- **Pull Request (PR)**: A proposal to merge code from one branch into the main project branch, enabling code reviews and automated CI checks before merging.

---

## 🤖 2. GitHub Actions Workflow Explained

Our automated pipeline is defined in [.github/workflows/ci.yml](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/.github/workflows/ci.yml).

### When Does It Run?
```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```
Every time code is pushed or a pull request is submitted, GitHub launches a fresh virtual machine (`ubuntu-latest`) to test the repository.

---

### Job 1: `backend-verification`
1. **Spins up MongoDB in Ubuntu**:
   ```yaml
   services:
     mongodb:
       image: mongo:6.0
       ports:
         - 27017:27017
   ```
2. **Installs Node.js 20 & Cached Dependencies**:
   Uses `npm ci` for fast, clean, reproducible installs.
3. **Syntax Checking**:
   Executes `node -c index.js` to ensure zero syntax errors exist in backend files.
4. **Runs Automated Unit Tests**:
   Runs Jest + Supertest suites against the live test database container.

---

### Job 2: `frontend-verification`
1. Installs frontend packages via `npm ci`.
2. Runs `npm run build` (`vite build`).
3. Verifies that all TypeScript components, Tailwind styles, and bundle chunks compile with **zero errors**.

---

### Job 3: `docker-verification`
Validates that `docker-compose.yml` has valid syntax, port mappings, and volume configurations using:
```bash
docker compose config
```

---

## 🌐 3. Production Cloud Deployment Architecture

If you wish to deploy this project live to the internet:

```
[User Browser]
      │
      ├──> [Frontend: Vercel / Netlify] (Static React 19 Build)
      │          │
      │          ▼
      └──> [Backend: Render / Railway] (Node.js Express Server)
                 │
                 ▼
           [Database: MongoDB Atlas] (Managed Cloud Database)
```

### Deployment Configuration Steps:

1. **Database**: Use your free **MongoDB Atlas** connection string (see [DATABASE_EXPLANATION.md](file:///C:/Users/ankit/OneDrive/Desktop/FSD_PROJECT/inventory-management/docs/DATABASE_EXPLANATION.md)).
2. **Backend (e.g. Render.com)**:
   - Connect your GitHub repository.
   - Build command: `npm install`
   - Start command: `node index.js`
   - Environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=https://your-frontend.vercel.app`.
3. **Frontend (e.g. Vercel.com)**:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.

> ⚠️ **Academic Honesty Notice**: The project repository contains complete, production-ready CI/CD configurations, Dockerfiles, and environment templates. Unless you have explicitly linked external cloud hosting billing accounts, the project is configured and demonstrated in your local Docker / localhost environment.
