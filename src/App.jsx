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
          {/* Public Route */}
          <Route path="/login" element={<AdminLogin />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
            </Route>
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
