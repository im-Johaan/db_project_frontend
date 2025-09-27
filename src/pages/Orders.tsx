import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import { ShoppingCart, Plus, Eye, Calendar, DollarSign, User, Package } from 'lucide-react';

interface Order {
  order_id: number;
  user_id: number;
  order_date: string;
  amount: number;
  user_name: string;
}

interface OrderDetail {
  order_id: number;
  p_id: number;
  quantity: number;
  unit_price: number;
  p_name: string;
}

interface Product {
  p_id: number;
  p_name: string;
  price: number;
}

export default function Orders() {
  const { hasRole } = useAuth();
  const { apiCall } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [orderProducts, setOrderProducts] = useState([{ p_id: '', quantity: '', unit_price: '' }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        apiCall('/orders'),
        apiCall('/products')
      ]);

      if (ordersRes.ok && productsRes.ok) {
        const [ordersData, productsData] = await Promise.all([
          ordersRes.json(),
          productsRes.json()
        ]);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validProducts = orderProducts.filter(p => p.p_id && p.quantity && p.unit_price);
    if (validProducts.length === 0) return;

    try {
      const response = await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify({
          products: validProducts.map(p => ({
            p_id: parseInt(p.p_id),
            quantity: parseInt(p.quantity),
            unit_price: parseFloat(p.unit_price)
          }))
        }),
      });

      if (response.ok) {
        loadData();
        closeModal();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    try {
      const response = await apiCall(`/orders/${order.order_id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(order);
        setOrderDetails(data.details || []);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const addProductRow = () => {
    setOrderProducts([...orderProducts, { p_id: '', quantity: '', unit_price: '' }]);
  };

  const removeProductRow = (index: number) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index));
  };

  const updateProductRow = (index: number, field: string, value: string) => {
    const updated = orderProducts.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setOrderProducts(updated);
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderProducts([{ p_id: '', quantity: '', unit_price: '' }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">#{order.order_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{order.user_name || 'Customer'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        ${order.amount || '0.00'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Get started by creating your first order</p>
        </div>
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                {orderProducts.map((product, index) => (
                  <div key={index} className="flex gap-3 mb-3 p-3 border border-gray-200 rounded-lg">
                    <select
                      value={product.p_id}
                      onChange={(e) => updateProductRow(index, 'p_id', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.p_id} value={p.p_id.toString()}>
                          {p.p_name} - ${p.price}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={product.quantity}
                      onChange={(e) => updateProductRow(index, 'quantity', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={product.unit_price}
                      onChange={(e) => updateProductRow(index, 'unit_price', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="0"
                      required
                    />
                    {orderProducts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProductRow}
                  className="mt-2 px-4 py-2 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  + Add Product
                </button>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Order #{selectedOrder.order_id} Details
            </h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">${selectedOrder.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            
            <h3 className="text-md font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{detail.p_name}</p>
                      <p className="text-sm text-gray-600">Quantity: {detail.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(detail.unit_price * detail.quantity)}</p>
                    <p className="text-sm text-gray-600">${detail.unit_price} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}