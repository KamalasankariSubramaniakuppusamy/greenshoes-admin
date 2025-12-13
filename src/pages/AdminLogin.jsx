// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// The login page for admin users - this is the gateway to the admin panel
// Completely separate from customer login as per security requirements
//
// REQUIREMENT SATISFIED: "The software shall have different Admin login URL and customer login 
// to prevent any kind of break-in and manipulative attacks"
// This login page lives at a separate URL (e.g., /admin/login or just /login in the admin app)
// and uses the AdminAuthContext, not customer auth



// React imports - useState for form state, useEffect for redirect logic
import React, { useState, useEffect } from 'react';
// For programmatic navigation after successful login
import { useNavigate } from 'react-router-dom';
// Our admin-specific auth context - keeps admin auth isolated from customer auth
import { useAdminAuth } from '../context/AdminAuthContext';
// Eye icons for password visibility toggle - nice UX touch
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  // ==================== FORM STATE ====================
  // Keeping form state simple - just email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Password visibility toggle - defaults to hidden for security
  const [showPassword, setShowPassword] = useState(false);
  // Error message to display if login fails
  const [error, setError] = useState('');
  // Loading state to disable button and show feedback during API call
  const [loading, setLoading] = useState(false);
  
  // Get login function and auth status from our admin context
  const { login, isAuthenticated } = useAdminAuth();
  // For redirecting after login
  const navigate = useNavigate();

  // Redirect if already logged in
  // This handles the case where someone navigates to /login but is already authenticated
  // No point showing them the login form again - just send them to products
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]); // Re-run if auth status changes

  // Form submission handler
  const handleSubmit = async (e) => {
    // Prevent default form submission - we're handling this ourselves
    e.preventDefault();
    // Clear any previous errors
    setError('');
    // Show loading state
    setLoading(true);

    // Attempt login through our auth context
    // The actual API call and role verification happens in AdminAuthContext
    const result = await login(email, password);
    
    // Done loading regardless of success/failure
    setLoading(false);
    
    if (result.success) {
      // Login successful - head to the products page
      // REQUIREMENT: "Single admin interface for product, inventory, and impact management"
      // Products page is the default landing spot for admins
      navigate('/products');
    } else {
      // Login failed - show the error message
      // Could be wrong credentials, non-admin user, server error, etc.
      setError(result.error);
    }
  };

  return (
    // Full height white background - clean and minimal
    <div className="min-h-screen bg-white">
      
      {/* ==================== HEADER SECTION ==================== */}
      {/* Brand header - same styling as admin panel for consistency */}
      {/* REQUIREMENT: "luxury shoe e-commerce platform" - branding matters everywhere */}
      <header className="bg-primary text-white py-12">
        <div className="text-center">
          {/* Brand name - Cinzel Decorative for that luxury serif look */}
          <h1 
            className="text-3xl tracking-widest"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            GREENSHOES
          </h1>
          {/* Tagline - ties into the eco-friendly ocean waste narrative */}
          {/* REQUIREMENT: "emphasizing an eco-friendly narrative" */}
          <p 
            className="text-xs tracking-[0.3em] text-gray-300 mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SCULPTED BY THE SEA
          </p>
        </div>
      </header>

      {/* ==================== LOGIN FORM SECTION ==================== */}
      {/* Centered form with generous padding - keeps it elegant */}
      <div className="flex items-center justify-center py-20">
        {/* Max width keeps form readable on large screens */}
        <div className="w-full max-w-md px-8">
          {/* Welcome message - friendly but professional */}
          {/* Making it clear this is the ADMIN login, not customer */}
          <h2 
            className="text-2xl text-center mb-12 tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            WELCOME BACK ADMIN!
          </h2>

          {/* Error message display */}
          {/* Only shows if there's an error - conditional rendering */}
          {/* Red styling makes it obvious something went wrong */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* The actual login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            {/* Using type="email" for built-in validation */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
                required // HTML5 validation - can't submit empty
                // Styled to match brand - dark background, centered text, rounded pill shape
                className="w-full px-6 py-4 bg-primary text-white placeholder-gray-400 rounded-full text-center text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-600"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>

            {/* Password Input with visibility toggle */}
            {/* Relative positioning for the eye icon overlay */}
            <div className="relative">
              <input
                // Toggle between text and password based on showPassword state
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                required
                // Same styling as email input for consistency
                className="w-full px-6 py-4 bg-primary text-white placeholder-gray-400 rounded-full text-center text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-600"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
              {/* Password visibility toggle button */}
              {/* Positioned absolutely to sit inside the input field */}
              <button
                type="button" // Important! Prevents form submission when clicking
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {/* Show EyeOff when password is visible, Eye when hidden */}
                {/* This matches user expectations - click to reveal/hide */}
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            {/* REQUIREMENT: "prevent break-in and manipulative attacks" */}
            {/* The actual security check happens in AdminAuthContext, but this is the entry point */}
            <button
              type="submit"
              disabled={loading} // Prevent double-submission while API call is in progress
              // Same pill style, with hover effect and disabled state
              className="w-full px-6 py-4 bg-primary text-white rounded-full text-sm tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {/* Show different text while loading - gives feedback to user */}
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
          
          {/* Note: No "Forgot Password" or "Sign Up" links here */}
          {/* Admin accounts are created manually, not self-service */}
          {/* This is intentional for security */}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

// REQUIREMENT MAPPING:
// 1. "Different Admin login URL and customer login" - This page is only accessible at admin routes
// 2. "Prevent break-in and manipulative attacks" - Separate auth flow, role checked in context
// 3. "Luxury e-commerce platform" - Branding consistent with the luxury aesthetic
// 4. "Desktop and mobile responsive design" - Flexible layout works on all screen sizes