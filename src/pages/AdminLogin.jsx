import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white py-12">
        <div className="text-center">
          <h1 
            className="text-3xl tracking-widest"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            GREENSHOES
          </h1>
          <p 
            className="text-xs tracking-[0.3em] text-gray-300 mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SCULPTED BY THE SEA
          </p>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-20">
        <div className="w-full max-w-md px-8">
          <h2 
            className="text-2xl text-center mb-12 tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            WELCOME BACK ADMIN!
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
                required
                className="w-full px-6 py-4 bg-primary text-white placeholder-gray-400 rounded-full text-center text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-600"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                required
                className="w-full px-6 py-4 bg-primary text-white placeholder-gray-400 rounded-full text-center text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-600"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-primary text-white rounded-full text-sm tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
