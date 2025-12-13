// App.jsx
// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// Main entry point for the GreenShoes Admin Panel
//
// REQUIREMENTS SATISFIED:
// - "Single admin interface for product, inventory, and impact management" 
//   → Unified routing structure with shared layout across all admin pages
// - "Different Admin login URL and customer login to prevent break-in attacks"
//   → This is a completely separate React app from the customer site, with its own auth flow
// - "Prevent break-in and manipulative attacks"
//   → ProtectedRoute wrapper ensures no admin content is accessible without valid credentials

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public - Admin login page */}
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Protected Routes - requires valid admin authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              {/* Products page satisfies: inventory updates, pricing, sales, multi-image products */}
              <Route path="/products" element={<ProductManagement />} />
              {/* Orders page satisfies: order ID display, address display, pricing breakdown */}
              <Route path="/orders" element={<OrderManagement />} />
            </Route>
          </Route>
          
          {/* Catch all - security measure to not expose admin panel structure */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;