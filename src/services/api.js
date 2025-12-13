// api.js
// This file has been modified regularly to accomodate new requirements or optimize the code to make the admin panel more efficient.
// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// Last touched: Added inventory and order endpoints after backend updates
//
// REQUIREMENTS SATISFIED BY THIS FILE:
// This is the API layer for the entire admin panel - it enables all the admin functionality requirements:
// - "Single admin interface for product, inventory, and impact management" (all endpoints here support that)
// - "Different Admin login URL and customer login to prevent break-in attacks" (separate /admin/* endpoints)
// - "Admin to update inventory in real-time" (inventoryAPI)
// - "Admin to add items with multiple pictures" (productsAPI with FormData)
// - "Administrator to change prices" and "place items on sale" (productsAPI methods)
// - "Each order shall be assigned unique confirmation ID" (ordersAPI for viewing)



// Some imports for API calls
// Using axios over fetch because of cleaner syntax and automatic JSON parsing - also easier to set up interceptors
import axios from 'axios';

// Fallback to localhost for local dev - in production this gets overridden by environment variable
// Note: Make sure VITE_API_URL is set in .env.production before deploying!
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance for admin - Why Axios? Because it simplifies HTTP requests and provides built-in support for features like interceptors, which are useful for handling authentication and error responses.
// Considered using fetch but interceptors would have been a pain to implement manually
//
// REQUIREMENT: "Different Admin login URL and customer login to prevent break-in and manipulative attacks"
// This axios instance is ONLY for admin requests - completely separate from any customer-facing API calls
// All endpoints use /admin/* prefix which the backend protects with role-based access control
const adminAxios = axios.create({
  baseURL: API_BASE,
  // Could add timeout here later if we run into slow response issues
  // timeout: 10000,
});

// Add auth token to requests - Uses JWT tokens stored in localStorage – This is for registered users only and for guest users we will have guestIDs
// This runs before every single request goes out - pretty handy
//
// SECURITY: This interceptor automatically attaches the admin JWT token to every request
// Without a valid admin token, the backend will reject all /admin/* requests with 401
adminAxios.interceptors.request.use((config) => {
  // Grab token from storage - will be null if not logged in
  const token = localStorage.getItem('admin_token');
  if (token) {
    // Standard Bearer token format that our backend expects
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
// This is basically our automatic logout mechanism when session expires or token is invalid
// Saves us from having to check auth status in every single component
//
// REQUIREMENT: "prevent break-in and manipulative attacks"
// If someone tries to use an expired or forged token, they get kicked out immediately
adminAxios.interceptors.response.use(
  (response) => response, // Happy path - just pass through
  (error) => {
    // 401 means unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear out all the stored admin data - don't want stale stuff hanging around
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Kick them back to login page - they'll need to authenticate again
      window.location.href = '/login';
    }
    // Still reject the promise so calling code can handle other errors if needed
    return Promise.reject(error);
  }
);

// ============================================
// API ENDPOINT DEFINITIONS START HERE
// Organized by resource type for easier navigation
// ============================================

// Admin Authentication (uses same auth endpoint, checks role) - This is to ensure RBAC requirements are met
// The backend handles the role verification - we just send credentials
//
// REQUIREMENT: "Different Admin login URL and customer login to prevent break-in"
// Although using same /auth/login endpoint, the AdminAuthContext checks for ADMIN role
// and stores in separate localStorage keys (admin_token vs regular token)
export const adminAPI = {
  // Simple login - backend returns token + user info if credentials are valid AND user has admin role
  login: (credentials) => adminAxios.post('/auth/login', credentials),
  // TODO: Maybe add logout endpoint later? For now we just clear localStorage on frontend
};

// Products API - NOW USES ADMIN ENDPOINT
// Changed from /products to /admin/products after we added role-based access on backend
//
// REQUIREMENTS SATISFIED:
// - "Admin to add items in the inventory with multiple pictures" (create method)
// - "Administrator to change the price of items in the inventory" (update method)
// - "Administrator to place items in the inventory on sale" (markOnSale/removeFromSale)
// - "Each product shall display available color and size options" (getAll returns these)
// - "Display luxury products with different sizes and color options" (data transformation below)
export const productsAPI = {
  // Get all products - this one has some data transformation happening
  // REQUIREMENT: "Single admin interface" - this powers the main products table
  getAll: async () => {
    const response = await adminAxios.get('/admin/products');
    // Transform to match expected format
    // The frontend components expect a certain structure so we massage the data here
    // rather than changing all the components - seemed easier at the time
    const products = response.data.products?.map(p => ({
      ...p, // Spread all existing properties first
      // Map main_image to image for consistency
      // Backend uses main_image but our product cards expect just "image"
      // REQUIREMENT: "multiple photos from different angles" - main_image is the primary display image
      image: p.main_image,
      // Colors as array of strings for join() in table
      // Sometimes colors come as objects with value prop, sometimes as plain strings - normalize here
      // REQUIREMENT: "different sizes and color options for each object"
      colors: p.colors?.map ? p.colors.map(c => typeof c === 'string' ? c : c.value) : p.colors || [],
      // Sizes as array of objects with value property for the table
      // Similar deal - making sure sizes are in consistent format for the UI
      sizes: p.sizes?.map ? p.sizes.map(s => typeof s === 'string' ? { value: s } : s) : p.sizes || [],
    })) || []; // Default to empty array if no products - prevents undefined errors
    return { data: { success: true, products } };
  },
  // Single product fetch - used in edit form and inventory management
  getById: (id) => adminAxios.get(`/admin/products/${id}`),
  // Create new product - uses FormData because we're uploading images
  // The Content-Type header is important here for multipart uploads
  // REQUIREMENT: "add items in the inventory with multiple pictures"
  create: (formData) => adminAxios.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Update existing product - same multipart setup as create
  // REQUIREMENT: "Administrator to change the price of items in the inventory"
  update: (id, formData) => adminAxios.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Delete - straightforward, no body needed
  // Removes product and all associated inventory/images
  delete: (id) => adminAxios.delete(`/admin/products/${id}`),
  // Sale management - added these when we implemented the sale feature
  // PATCH because we're only updating a subset of the product data
  // REQUIREMENT: "Administrator to place items in the inventory on sale"
  // REQUIREMENT: "emphasize 'on Sale' items in the landing page" - this is how items get marked for that
  markOnSale: (id, salePrice) => adminAxios.patch(`/admin/products/${id}/sale/mark`, { sale_price: salePrice }),
  removeFromSale: (id) => adminAxios.patch(`/admin/products/${id}/sale/remove`),
  // Could add bulk operations here later if needed
};

// Inventory API
// Separated from products because inventory updates are frequent and we wanted cleaner endpoints
//
// REQUIREMENTS SATISFIED:
// - "Admin to update inventory in real-time with immediate user visibility"
// - "Add or modify the quantities of items in the inventory per size and color"
// - "Inventory quantity shall never BE negative" (backend validates this)
// - "Inventory updates shall be immediately visible to users" (real-time update)
// - "Update the quantity of items in each size as sales are performed"
export const inventoryAPI = {
  // Update stock levels - takes productId and inventory data (quantity, sizes, etc)
  // This is the core of real-time inventory management
  // The backend immediately updates the database, making changes visible to customers
  update: (productId, data) => adminAxios.patch(`/admin/products/${productId}/inventory`, data),
};

// Orders API
// Read-only for now - admins can view but order modifications happen through different flow
//
// REQUIREMENTS SATISFIED:
// - "Each order shall be assigned a unique confirmation ID for identification and tracking"
// - "Display the order ID, shoe color, size, billing address, shipping address, and total amount"
// - "Flat shipping rate of $11.95 shall be applied" (visible in order details)
// - "Tax of 6% shall be applied per product" (visible in order details)
// - "The software shall not support any kinds of refunds/return" (no update/cancel endpoints)
export const ordersAPI = {
  // Get all orders - paginated on backend, returns most recent first
  // Powers the Order Management table in admin panel
  getAll: () => adminAxios.get('/admin/orders'),
  // Get single order with all details - line items, shipping info, etc
  // REQUIREMENT: "display order ID, shoe color, size, billing/shipping address, total amount"
  // This endpoint returns everything needed to satisfy that requirement
  getById: (orderId) => adminAxios.get(`/admin/orders/${orderId}`),
  // TODO: Add updateStatus endpoint when we implement order status management
  // Note: No refund/cancel endpoints per requirement "software shall not support refunds/return"
};

// Colors API - uses admin endpoint
// These next two (colors and sizes) are kind of hacky - we extract them from products
// Ideally these would be their own database tables but this works for now
//
// Used by: ProductManagement.jsx for variant color dropdowns
// REQUIREMENT: "different sizes and color options for each object"
export const colorsAPI = {
  getAll: async () => {
    // Fetch all products just to get the colors - not super efficient but works
    // TODO: Could add a dedicated /admin/colors endpoint on backend for better performance
    const response = await adminAxios.get('/admin/products');
    // Extract unique colors from all products
    // flatMap flattens the nested arrays into one big array
    const allColors = response.data.products?.flatMap(p => p.colors || []) || [];
    // Use Map to dedupe - the key ensures uniqueness
    const uniqueColors = [...new Map(allColors.map(c => [typeof c === 'string' ? c : c, { id: c, value: c }])).values()];
    return { data: { colors: uniqueColors } };
  },
  // No create/update/delete - colors are managed through products for now
  // New colors get added when creating/editing products with new color variants
};

// Sizes API - uses admin endpoint
// Same pattern as colors above - derived from products data
//
// Used by: ProductManagement.jsx for size inputs and reference
// REQUIREMENT: "different sizes and color options for each object"
export const sizesAPI = {
  getAll: async () => {
    const response = await adminAxios.get('/admin/products');
    // Extract unique sizes from all products
    const allSizes = response.data.products?.flatMap(p => p.sizes || []) || [];
    // Set automatically removes duplicates - nice and clean
    const uniqueSizeValues = [...new Set(allSizes)];
    // Transform to expected format with id and value
    const sizes = uniqueSizeValues.map(v => ({ id: v, value: v }));
    return { data: { sizes } };
  },
  // No create/update/delete - sizes are managed through products
  // New sizes get added when creating/editing products with new size options
};

// Export the axios instance in case any component needs to make custom requests
// Most of the time the specific API objects above should be used instead though
export default adminAxios;

// ============================================
// REQUIREMENT MAPPING SUMMARY
// ============================================
//
// This API layer enables ALL admin functionality. Here's the complete mapping:
//
// SECURITY & ACCESS:
// - "Different Admin login URL and customer login" ✓ (separate axios instance, /admin/* endpoints)
// - "Prevent break-in and manipulative attacks" ✓ (JWT auth, 401 handling, role-based endpoints)
//
// PRODUCT MANAGEMENT:
// - "Add items with multiple pictures" ✓ (productsAPI.create with FormData)
// - "Change price of items" ✓ (productsAPI.update)
// - "Place items on sale" ✓ (productsAPI.markOnSale/removeFromSale)
// - "Sizes and color options for each object" ✓ (data transformation in getAll)
//
// INVENTORY MANAGEMENT:
// - "Update inventory in real-time with immediate user visibility" ✓ (inventoryAPI.update)
// - "Modify quantities per size and color" ✓ (inventoryAPI.update)
// - "Inventory quantity shall never be negative" ✓ (backend validation)
//
// ORDER MANAGEMENT:
// - "Unique confirmation ID for tracking" ✓ (ordersAPI returns order_id)
// - "Display order ID, color, size, addresses, total" ✓ (ordersAPI.getById)
// - "No refunds/returns" ✓ (no update/cancel endpoints intentionally)
//
// SYSTEM:
// - "Single admin interface" ✓ (all endpoints support the unified admin panel)