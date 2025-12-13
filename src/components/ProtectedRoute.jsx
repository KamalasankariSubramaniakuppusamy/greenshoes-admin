// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// This is our auth guard component - wraps admin routes to prevent unauthorized access
// Without this, anyone could just type /products in the URL and get in - not ideal!
//
// REQUIREMENT SATISFIED: "The software shall have different Admin login URL and customer login 
// to prevent any kind of break-in and manipulative attacks"
// This component is a critical part of that security requirement - it enforces that only 
// authenticated admins can access the admin panel, preventing unauthorized URL manipulation



// React imports
import React from 'react';
// Navigate for redirects, Outlet for rendering child routes when auth passes
import { Navigate, Outlet } from 'react-router-dom';
// Our auth context - gives us the current authentication state
// Note: This is AdminAuthContext, completely separate from customer auth
// That separation is intentional - part of the "different admin login" requirement
import { useAdminAuth } from '../context/AdminAuthContext';

// ProtectedRoute Component
// Sits between the router and actual admin pages
// Think of it as a bouncer - checks if you're on the list before letting you in
//
// SECURITY NOTE: This component prevents "break-in and manipulative attacks" by:
// 1. Checking auth state before rendering any admin content
// 2. Redirecting unauthorized users immediately
// 3. Not exposing any admin UI to unauthenticated users (not even a flash)
const ProtectedRoute = () => {
  // Grab auth state from context
  // isAuthenticated: boolean - do we have a valid logged-in admin user?
  // loading: boolean - are we still checking auth status? (happens on page refresh)
  const { isAuthenticated, loading } = useAdminAuth();

  // Handle the loading state first
  // This happens when the page refreshes and we're still verifying the token
  // Without this check, users would briefly see a redirect to login even if they're authenticated
  // Also prevents a security gap where admin content might flash before redirect
  if (loading) {
    return (
      // Full screen centered spinner - keeps it simple
      // Gray background so it doesn't feel jarring
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Simple CSS spinner using Tailwind's animate-spin */}
        {/* Using our primary color (green) to match the brand */}
        {/* Could swap this for a fancier loading component later but this works fine */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // The actual protection logic - pretty straightforward but crucial for security
  // If authenticated: render the child route (Outlet) - admin gets access
  // If not authenticated: redirect to login page - no admin access for you!
  // 
  // The 'replace' prop on Navigate is important - it replaces the current history entry
  // So if someone tries to go to /products without auth, they get sent to /login
  // and hitting the back button won't put them in a redirect loop
  // This also prevents attackers from using browser history to sneak back in
  //
  // REQUIREMENT: This binary check (authenticated or not) ensures the admin panel
  // is completely inaccessible to anyone without valid admin credentials
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

// Usage note (for my future self):
// This component is used in the router like this:
// <Route element={<ProtectedRoute />}>
//   <Route path="/products" element={<ProductsPage />} />
//   <Route path="/orders" element={<OrdersPage />} />
// </Route>
// All routes nested inside ProtectedRoute will require authentication
//
// REQUIREMENT MAPPING:
// By wrapping all admin routes with this component, we satisfy:
// - Separate admin access (different from customer access)
// - Prevention of URL manipulation attacks (can't just type /products to get in)
// - Single admin interface protection (one guard for all admin features)