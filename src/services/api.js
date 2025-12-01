import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance for admin
const adminAxios = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin Authentication (uses same auth endpoint, checks role)
export const adminAPI = {
  login: (credentials) => adminAxios.post('/auth/login', credentials),
};

// Products API - NOW USES ADMIN ENDPOINT
export const productsAPI = {
  getAll: async () => {
    const response = await adminAxios.get('/admin/products');
    // Transform to match expected format
    const products = response.data.products?.map(p => ({
      ...p,
      // Map main_image to image for consistency
      image: p.main_image,
      // Colors as array of strings for join() in table
      colors: p.colors?.map ? p.colors.map(c => typeof c === 'string' ? c : c.value) : p.colors || [],
      // Sizes as array of objects with value property for the table
      sizes: p.sizes?.map ? p.sizes.map(s => typeof s === 'string' ? { value: s } : s) : p.sizes || [],
    })) || [];
    return { data: { success: true, products } };
  },
  getById: (id) => adminAxios.get(`/admin/products/${id}`),
  create: (formData) => adminAxios.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => adminAxios.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => adminAxios.delete(`/admin/products/${id}`),
  markOnSale: (id, salePrice) => adminAxios.patch(`/admin/products/${id}/sale/mark`, { sale_price: salePrice }),
  removeFromSale: (id) => adminAxios.patch(`/admin/products/${id}/sale/remove`),
};

// Inventory API
export const inventoryAPI = {
  update: (productId, data) => adminAxios.patch(`/admin/products/${productId}/inventory`, data),
};

// Orders API
export const ordersAPI = {
  getAll: () => adminAxios.get('/admin/orders'),
  getById: (orderId) => adminAxios.get(`/admin/orders/${orderId}`),
};

// Colors API - uses admin endpoint now
export const colorsAPI = {
  getAll: async () => {
    const response = await adminAxios.get('/admin/products');
    // Extract unique colors from all products
    const allColors = response.data.products?.flatMap(p => p.colors || []) || [];
    const uniqueColors = [...new Map(allColors.map(c => [typeof c === 'string' ? c : c, { id: c, value: c }])).values()];
    return { data: { colors: uniqueColors } };
  },
};

// Sizes API - uses admin endpoint now
export const sizesAPI = {
  getAll: async () => {
    const response = await adminAxios.get('/admin/products');
    // Extract unique sizes from all products
    const allSizes = response.data.products?.flatMap(p => p.sizes || []) || [];
    const uniqueSizeValues = [...new Set(allSizes)];
    const sizes = uniqueSizeValues.map(v => ({ id: v, value: v }));
    return { data: { sizes } };
  },
};

export default adminAxios;