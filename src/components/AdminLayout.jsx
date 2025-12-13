// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// Main layout wrapper for all admin pages - handles the persistent header/nav and renders child routes
// This keeps the navigation consistent across all admin views without repeating code
//
// REQUIREMENT SATISFIED: "The software shall have Single admin interface for product, inventory, and impact management"
// This layout component is the backbone of that single admin interface - everything admin-related lives inside this wrapper



// React imports
import React from 'react';
// React Router stuff - NavLink gives us that nice active state styling, Outlet renders child routes
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// Our custom auth context - handles all the login/logout state management
// REQUIREMENT: "The software shall have different Admin login URL and customer login to prevent any kind of break-in and manipulative attacks"
// This separate AdminAuthContext (not the regular user auth) helps enforce that separation
import { useAdminAuth } from '../context/AdminAuthContext';
// Using Lucide icons - they're clean and match our minimal aesthetic
// Just need the logout icon here for now
import { LogOut } from 'lucide-react';

const AdminLayout = () => {
  // Pull logout function from our auth context
  // We don't need the user info here, just the ability to log out
  const { logout } = useAdminAuth();
  // For programmatic navigation after logout
  const navigate = useNavigate();

  // Logout handler - clears auth state and redirects to login
  // Keeping this simple - the actual token cleanup happens in the logout function
  // This ensures admin sessions are properly terminated - security requirement
  const handleLogout = () => {
    logout(); // Clears localStorage and auth state
    navigate('/login'); // Send them back to login page
  };

  return (
    // Full height wrapper with white background - keeps things clean
    <div className="min-h-screen bg-white">
      
      {/* ==================== HEADER SECTION ==================== */}
      {/* Using our primary brand color (dark green) for the header */}
      {/* REQUIREMENT: "luxury shoe e-commerce platform" - branding consistency matters even in admin panel */}
      <header className="bg-primary text-white">
        
        {/* Logo Section */}
        {/* Centered logo with tagline - matches the main site branding */}
        {/* REQUIREMENT: "emphasizing an eco-friendly narrative" - tagline reinforces this brand identity */}
        <div className="text-center py-4 border-b border-gray-800">
          {/* Brand name - using Cinzel Decorative for that luxury feel */}
          {/* Inline style because Tailwind doesn't have this font by default */}
          <h1 
            className="text-2xl tracking-widest"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            GREENSHOES
          </h1>
          {/* Tagline - slightly smaller and muted */}
          {/* Playfair Display for elegance - consistent with our brand typography */}
          {/* "Sculpted by the Sea" ties into the ocean waste -> luxury shoes narrative */}
          <p 
            className="text-xs tracking-[0.3em] text-gray-300 mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SCULPTED BY THE SEA
          </p>
        </div>

        {/* ==================== NAVIGATION SECTION ==================== */}
        {/* Main admin navigation - kept minimal since we only have 2 sections for now */}
        {/* 
           REQUIREMENT: "Single admin interface for product, inventory, and impact management"
           These two nav links provide access to all admin functionality from one unified interface:
           - Products link -> covers product management, inventory, pricing, sales (all the admin product requirements)
           - Orders link -> covers order viewing and management
        */}
        <nav className="container mx-auto px-6">
          {/* Flexbox for horizontal layout - nav links on left, logout on right */}
          <div className="flex items-center justify-between py-4">
            
            {/* Left side - main navigation links */}
            {/* gap-12 gives nice spacing between the two main sections */}
            <div className="flex items-center gap-12">
              
              {/* Products & Inventory Link */}
              {/* NavLink automatically handles active state - pretty convenient */}
              {/* 
                 REQUIREMENTS COVERED UNDER THIS SECTION:
                 - "Admin to update inventory in real-time with immediate user visibility"
                 - "Admin to add items in the inventory with multiple pictures"
                 - "Admin to add or modify the quantities of items in the inventory per size and color"
                 - "Administrator to change the price of items in the inventory"
                 - "Administrator to place items in the inventory on sale"
                 All of these are accessible through the Products page this links to
              */}
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  // Active link is white, inactive is gray with hover effect
                  // This destructured isActive thing is a NavLink feature - saves us from manual route checking
                  `text-sm tracking-wider transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                PRODUCT & INVENTORY MANAGEMENT
              </NavLink>
              
              {/* Orders Link */}
              {/* Same styling pattern as above - keeping it consistent */}
              {/* 
                 REQUIREMENT RELATED: "Each order shall be assigned a unique confirmation ID for identification and tracking purposes"
                 Admin needs to be able to view these orders - this is the entry point
              */}
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `text-sm tracking-wider transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ORDER MANAGEMENT
              </NavLink>
              
              {/* TODO: Maybe add more nav items later? Analytics dashboard? User management? */}
              {/* Note: Impact management could go here if we expand that feature */}
            </div>

            {/* Right side - Logout button */}
            {/* Styled as a subtle button rather than a prominent one - logout shouldn't be the focus */}
            {/* Important for security - admins need a clear way to end their session */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              {/* Icon from Lucide - size 18 looks good with the text */}
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      {/* This is where child routes get rendered via Outlet */}
      {/* Container keeps content width consistent, padding for breathing room */}
      {/* REQUIREMENT: "desktop and mobile responsive design" - container class helps with this */}
      <main className="container mx-auto px-6 py-8">
        {/* Outlet is React Router's way of saying "render whatever child route matches here" */}
        {/* So /products renders ProductsPage, /orders renders OrdersPage, etc. */}
        {/* This is how we achieve the "single interface" requirement - one layout, multiple views */}
        <Outlet />
      </main>
      
      {/* No footer for admin panel - keeping it clean and functional */}
      {/* Could add one later if we need copyright info or quick links */}
    </div>
  );
};

export default AdminLayout;