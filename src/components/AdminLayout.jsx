import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white">
        {/* Logo */}
        <div className="text-center py-4 border-b border-gray-800">
          <h1 
            className="text-2xl tracking-widest"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            GREENSHOES
          </h1>
          <p 
            className="text-xs tracking-[0.3em] text-gray-300 mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SCULPTED BY THE SEA
          </p>
        </div>

        {/* Navigation */}
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-12">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-sm tracking-wider transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`
                }
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                PRODUCT & INVENTORY MANAGEMENT
              </NavLink>
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
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
