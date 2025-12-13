// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// This is the authentication context specifically for the admin panel
// Keeps admin auth completely separate from customer auth - important for security!
//
// REQUIREMENT SATISFIED: "The software shall have different Admin login URL and customer login 
// to prevent any kind of break-in and manipulative attacks"
// This entire context is dedicated to admin authentication only - no overlap with customer auth
// Even if someone has a valid customer account, they can't use it here



// React imports - need all the context goodies plus useEffect for initialization
import React, { createContext, useContext, useState, useEffect } from 'react';
// Our admin API service - handles the actual login request to backend
import { adminAPI } from '../services/api';

// Create the context - this will hold our admin auth state
// Separate from any customer auth context that might exist
const AdminAuthContext = createContext();

// Custom hook for consuming the context
// Makes it cleaner to use in components - just call useAdminAuth() instead of useContext(AdminAuthContext)
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  // Safety check - if someone tries to use this outside the provider, let them know
  // This has saved me debugging time more than once
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// The main provider component - wraps the admin app and provides auth state to all children
// REQUIREMENT: This provider enforces the separation between admin and customer authentication
export const AdminAuthProvider = ({ children }) => {
  // admin: holds the logged-in admin user object (or null if not logged in)
  const [admin, setAdmin] = useState(null);
  // loading: true while we're checking if there's an existing session
  // Prevents flash of login page when refreshing while already authenticated
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  // This runs once when the app loads - checks if admin was already logged in
  useEffect(() => {
    // Look for stored token and user data from previous session
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_user');
    
    // If both exist, try to restore the session
    if (token && adminData) {
      try {
        // Parse the stored user data and set it as current admin
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        // JSON parsing failed - corrupted data, clear it out
        // Better to make them log in again than deal with broken state
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    // Done checking - set loading to false so the app can render
    setLoading(false);
  }, []); // Empty dependency array = only runs on mount

  // Login function - called from the login form
  // Returns success/error status so the form can show appropriate feedback
  const login = async (email, password) => {
    try {
      // Hit the login endpoint with credentials
      const response = await adminAPI.login({ email, password });
      const { token, user } = response.data;
      
      // CRITICAL SECURITY CHECK - RBAC requirement
      // REQUIREMENT: "Single admin interface" with proper access control
      // Even if login succeeds, we verify the user actually has ADMIN role
      // This prevents regular customers from accessing admin panel even if they 
      // somehow get to the admin login page
      if (user.role !== 'ADMIN') {
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
      
      // All good - store the session data
      // Token goes to localStorage so it persists across page refreshes
      // Using 'admin_token' key (not just 'token') to avoid conflicts with customer auth
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      // Update state so the app knows we're logged in
      setAdmin(user);
      
      return { success: true };
    } catch (error) {
      // Login failed - could be wrong credentials, server error, etc.
      // Return the error message from backend if available, otherwise generic message
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Logout function - clears all admin session data
  // Called when admin clicks logout or when session expires (via axios interceptor)
  const logout = () => {
    // Clear stored credentials
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    // Clear state - this triggers re-render and ProtectedRoute will redirect to login
    setAdmin(null);
    // Note: We don't navigate here - that's handled by the component calling logout
  };

  // Provide the auth state and functions to all children
  // isAuthenticated is derived from admin state - true if we have an admin object
  return (
    <AdminAuthContext.Provider value={{ 
      admin,                        // The admin user object (for displaying name, etc.)
      isAuthenticated: !!admin,     // Boolean for easy auth checks
      loading,                      // True while checking existing session
      login,                        // Function to log in
      logout                        // Function to log out
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// REQUIREMENT MAPPING SUMMARY:
// This context satisfies several security requirements:
// 1. "Different Admin login URL and customer login" - Separate context from customer auth
// 2. "Prevent break-in and manipulative attacks" - Role check ensures only ADMINs can access
// 3. "Single admin interface" - Centralized auth state for all admin features
//
// The role check (user.role !== 'ADMIN') is especially important - it's our last line of 
// defense even if someone bypasses other security measures