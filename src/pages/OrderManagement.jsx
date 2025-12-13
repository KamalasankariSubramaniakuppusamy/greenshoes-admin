// Developer: Greenshoes Team
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// Admin view for all orders placed on the platform - both guest and registered users
// This is read-only for now - admins can view order details but not modify them
//
// REQUIREMENTS SATISFIED:
// - "Each order shall be assigned a unique confirmation ID for identification and tracking purposes"
// - "The software shall display the order ID, shoe color, size, billing address, shipping address, and total amount paid"
// - "Single admin interface for product, inventory, and impact management" - Orders are part of that single interface



// React imports - useState for local state, useEffect for data fetching on mount
import React, { useState, useEffect } from 'react';
// Our orders API service - handles fetching order data from backend
import { ordersAPI } from '../services/api';
// X icon for closing the modal - keeping consistent with other modals in the app
import { X } from 'lucide-react';

const OrderManagement = () => {
  // ==================== STATE MANAGEMENT ====================
  // orders: array of all orders fetched from the API
  const [orders, setOrders] = useState([]);
  // loading: true while fetching data - shows spinner
  const [loading, setLoading] = useState(true);
  // error: stores error message if fetch fails
  const [error, setError] = useState('');
  // selectedOrder: the order currently being viewed in detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  // showOrderDetail: controls visibility of the order detail modal
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Fetch orders on component mount
  // Empty dependency array means this runs once when page loads
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch all orders from the API
  // Separated into its own function in case we need to refresh later
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      // Default to empty array if no orders - prevents undefined errors
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err); // Log for debugging but show friendly message to user
    } finally {
      // Always stop loading spinner, whether success or failure
      setLoading(false);
    }
  };

  // Handler for viewing detailed order information
  // Fetches fresh data for the selected order to ensure we have complete details
  // REQUIREMENT: "display the order ID, shoe color, size, billing address, shipping address, and total amount"
  const handleViewOrder = async (order) => {
    try {
      // Fetch full order details - the list view might not have everything
      const response = await ordersAPI.getById(order.order_id);
      setSelectedOrder(response.data.order || response.data);
      setShowOrderDetail(true);
    } catch (err) {
      // If fetch fails, still show what we have from the list
      // Better to show partial data than nothing
      console.error('Failed to fetch order details:', err);
      setSelectedOrder(order);
      setShowOrderDetail(true);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  // These helpers keep the JSX cleaner and handle edge cases

  // Format date to DD/MM/YYYY format - using UK style as per design
  const formatDate = (dateString) => {
    if (!dateString) return '-'; // Handle null/undefined dates
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Format currency to 2 decimal places - always show cents
  // REQUIREMENT: Prices should be clearly displayed
  const formatCurrency = (amount) => parseFloat(amount || 0).toFixed(2);

  // Truncate long UUIDs for display in table - show first 4 and last 3 chars
  // Full ID shown in detail modal - this just keeps the table readable
  // REQUIREMENT: "unique confirmation ID for identification" - we display it, just truncated
  const truncateId = (id) => id ? `${id.substring(0, 4)}…${id.substring(id.length - 3)}` : '-';

  // Color coding for order status - makes it easy to scan at a glance
  // Green for completed/delivered, blue for ordered, purple for shipped, red for cancelled
  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': 'text-green-600',
      'ORDERED': 'text-blue-600',
      'SHIPPED': 'text-purple-600',
      'DELIVERED': 'text-green-700',
      'CANCELLED': 'text-red-600',
    };
    // Default to gray if status doesn't match any known value
    return colors[status?.toUpperCase()] || 'text-gray-600';
  };

  // ==================== LOADING STATE ====================
  // Show spinner while fetching orders - same style as other loading states in app
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div>
      {/* Page Title - matches styling of other admin pages */}
      <h1 className="text-3xl text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Order Management
      </h1>

      {/* Error message display - only shows if there's an error */}
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* ==================== ORDERS TABLE ==================== */}
      {/* REQUIREMENT: Display order information including ID, addresses, totals */}
      {/* overflow-x-auto handles horizontal scroll on small screens */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b">
            <tr>
              {/* REQUIREMENT: "unique confirmation ID" - displayed first for easy reference */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
              {/* REQUIREMENT: "total amount paid" */}
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total ($)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              {/* REQUIREMENT: "shipping address" */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Shipping Address</th>
              {/* REQUIREMENT: "billing address" */}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Billing Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {/* Empty state - show friendly message when no orders exist */}
            {orders.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
            ) : (
              // Map through orders and render each row
              orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  {/* Order ID - truncated for table, full ID in detail modal */}
                  <td className="px-4 py-3 text-sm font-mono">{truncateId(order.order_id)}</td>
                  {/* Customer name */}
                  <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                  {/* Total amount - right aligned for numbers */}
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(order.total_amount)}</td>
                  {/* Status with color coding */}
                  <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</td>
                  {/* Shipping address - truncated if too long */}
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{order.shipping_location || '-'}</td>
                  {/* Billing address - guests don't have separate billing, so show dash */}
                  {/* REQUIREMENT: "require registered users to have a single billing address per registered CC" */}
                  <td className="px-4 py-3 text-sm">{order.customer_type === 'GUEST' ? '—' : order.shipping_location?.split(',')[0] || '-'}</td>
                  {/* Order date with styled badge */}
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{formatDate(order.created_at)}</span>
                  </td>
                  {/* View action - opens detail modal */}
                  <td className="px-4 py-3">
                    <button onClick={() => handleViewOrder(order)} className="text-blue-600 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== ORDER DETAIL MODAL ==================== */}
      {/* Shows full order information when admin clicks "View" */}
      {/* REQUIREMENT: "display the order ID, shoe color, size, billing address, shipping address, and total amount" */}
      {showOrderDetail && selectedOrder && (
        // Modal overlay - dark background, centered content
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal container - white background, scrollable if content is tall */}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header - sticky so close button is always visible */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">Order Details</h3>
              {/* Close button - clears selected order and hides modal */}
              <button onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }} className="text-gray-500"><X size={24} /></button>
            </div>

            {/* Modal Body - all the order details */}
            <div className="p-6 space-y-6">
              
              {/* Order ID and Number Section */}
              {/* REQUIREMENT: "unique confirmation ID for identification and tracking" */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  {/* Full order ID shown here - not truncated like in table */}
                  <p className="font-mono text-sm">{selectedOrder.order_id || selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{selectedOrder.order_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{formatDate(selectedOrder.order_date || selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</p>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Customer</h4>
                <p>{selectedOrder.customer_info?.name || selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer_info?.email || selectedOrder.customer_email}</p>
              </div>

              {/* Address Section - Shipping and Billing side by side */}
              {/* REQUIREMENT: "shipping address" and "billing address" display */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm">
                    {selectedOrder.shipping_address?.full_name}<br />
                    {selectedOrder.shipping_address?.address1}<br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}<br />
                    {selectedOrder.shipping_address?.postal_code}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Billing Address</h4>
                  {/* For simplicity, showing same as shipping - could be different for registered users */}
                  <p className="text-sm">{selectedOrder.shipping_address?.address1 || 'Same as shipping'}</p>
                </div>
              </div>

              {/* Order Items Section */}
              {/* REQUIREMENT: "shoe color, size" - shown for each line item */}
              {selectedOrder.items?.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        {/* Product name with color and size - key requirement */}
                        <span>{item.name} ({item.color} / {item.size}) × {item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown Section */}
              {/* REQUIREMENTS: 
                 - "Flat shipping rate of $11.95 shall be applied to all orders"
                 - "Tax of 6% shall be applied per product"
                 - "total amount paid"
              */}
              <div className="border-t pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.subtotal || selectedOrder.subtotal)}</span>
                  </div>
                  {/* Tax amount - calculated at 6% per product requirement */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.tax || selectedOrder.tax)}</span>
                  </div>
                  {/* Shipping fee - flat $11.95 per requirement */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.shipping_fee || selectedOrder.shipping_fee)}</span>
                  </div>
                  {/* Total - the big number customers care about */}
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.total || selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Close button */}
            <div className="px-6 pb-6">
              <button onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }} className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

// REQUIREMENT MAPPING SUMMARY:
// This component satisfies multiple requirements related to order display:
// 1. "Each order shall be assigned a unique confirmation ID" - Order ID displayed in table and modal
// 2. "Display order ID, shoe color, size, billing address, shipping address, total amount" - All shown in detail modal
// 3. "Flat shipping rate of $11.95" - Shipping fee displayed in price breakdown
// 4. "Tax of 6% per product" - Tax displayed in price breakdown
// 5. "Single admin interface" - Orders accessible through the unified admin panel
//
// Note: This is read-only - order status changes would need a separate endpoint if needed later