# GreenShoes Admin Panel

Admin dashboard for managing products, inventory, and orders.

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your backend URL
# VITE_API_URL=http://localhost:4000/api

# 4. Start development server
npm run dev
```

Admin panel runs on **http://localhost:5174**

## Deploy to Vercel

### Option 1: GitHub + Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/greenshoes-admin.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo
   - Add Environment Variable:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend.onrender.com/api`
   - Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# When prompted:
# - Set up and deploy: Y
# - Which scope: (your account)
# - Link to existing project: N
# - Project name: greenshoes-admin
# - Directory: ./
# - Override settings: N

# Add environment variable
vercel env add VITE_API_URL
# Enter: https://your-backend.onrender.com/api
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

## Project Structure

```
greenshoes-admin/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── AdminLayout.jsx
    │   └── ProtectedRoute.jsx
    ├── context/
    │   └── AdminAuthContext.jsx
    ├── pages/
    │   ├── AdminLogin.jsx
    │   ├── ProductManagement.jsx
    │   └── OrderManagement.jsx
    └── services/
        └── api.js
```

## Features

- **Login:** Admin authentication (checks for ADMIN role)
- **Products:** View, add, edit, delete products
- **Inventory:** Expand product row to manage stock per size/color
- **Orders:** View all orders with details modal

## API Endpoints Used

| Feature | Endpoint |
|---------|----------|
| Login | POST /api/auth/login |
| Get Products | GET /api/admin/products |
| Get Product | GET /api/admin/products/:id |
| Create Product | POST /api/admin/products |
| Update Product | PUT /api/admin/products/:id |
| Delete Product | DELETE /api/admin/products/:id |
| Update Inventory | PATCH /api/admin/products/:id/inventory |
| Get Orders | GET /api/admin/orders |
| Get Order | GET /api/admin/orders/:orderId |

## Admin User

Make sure you have an admin user in your database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

Or create one via your backend.
