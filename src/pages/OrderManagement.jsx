import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { X } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const response = await ordersAPI.getById(order.order_id);
      setSelectedOrder(response.data.order || response.data);
      setShowOrderDetail(true);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setSelectedOrder(order);
      setShowOrderDetail(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => parseFloat(amount || 0).toFixed(2);

  const truncateId = (id) => id ? `${id.substring(0, 4)}…${id.substring(id.length - 3)}` : '-';

  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': 'text-green-600',
      'ORDERED': 'text-blue-600',
      'SHIPPED': 'text-purple-600',
      'DELIVERED': 'text-green-700',
      'CANCELLED': 'text-red-600',
    };
    return colors[status?.toUpperCase()] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Order Management
      </h1>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total ($)</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Shipping Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Billing Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{truncateId(order.order_id)}</td>
                  <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(order.total_amount)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{order.shipping_location || '-'}</td>
                  <td className="px-4 py-3 text-sm">{order.customer_type === 'GUEST' ? '—' : order.shipping_location?.split(',')[0] || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleViewOrder(order)} className="text-blue-600 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button onClick={() => { setShowOrderDetail(false); setSelectedOrder(null); }} className="text-gray-500"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
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

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Customer</h4>
                <p>{selectedOrder.customer_info?.name || selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer_info?.email || selectedOrder.customer_email}</p>
              </div>

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
                  <p className="text-sm">{selectedOrder.shipping_address?.address1 || 'Same as shipping'}</p>
                </div>
              </div>

              {selectedOrder.items?.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} ({item.color} / {item.size}) × {item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.subtotal || selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.tax || selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.shipping_fee || selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${formatCurrency(selectedOrder.price_breakdown?.total || selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

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
