import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, Calendar } from 'lucide-react';

interface OrderAnalytics {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  order_date: string;
  daily_orders: number;
}

interface ProductAnalytics {
  p_name: string;
  price: number;
  total_sold: number;
  total_revenue: number;
}

export default function Analytics() {
  const { hasRole } = useAuth();
  const { apiCall } = useApi();
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [orderRes, productRes] = await Promise.all([
        apiCall('/analytics/orders'),
        apiCall('/analytics/products')
      ]);

      if (orderRes.ok && productRes.ok) {
        const [orderData, productData] = await Promise.all([
          orderRes.json(),
          productRes.json()
        ]);
        setOrderAnalytics(Array.isArray(orderData) ? orderData : []);
        setProductAnalytics(Array.isArray(productData) ? productData : []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return orderAnalytics.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  };

  const getTotalOrders = () => {
    return orderAnalytics.reduce((sum, item) => sum + (item.total_orders || 0), 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{subtitle}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your business performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${getTotalRevenue().toLocaleString()}`}
          subtitle="+12% from last month"
          color="bg-green-600"
        />
        <MetricCard
          icon={ShoppingCart}
          title="Total Orders"
          value={getTotalOrders().toLocaleString()}
          subtitle="+8% from last week"
          color="bg-blue-600"
        />
        <MetricCard
          icon={BarChart3}
          title="Average Order Value"
          value={`$${getAverageOrderValue().toFixed(2)}`}
          subtitle="+5% from last month"
          color="bg-purple-600"
        />
        <MetricCard
          icon={Package}
          title="Top Products"
          value={productAnalytics.length}
          subtitle="Products tracked"
          color="bg-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Orders</h2>
          {orderAnalytics.length > 0 ? (
            <div className="space-y-4">
              {orderAnalytics.slice(0, 7).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(item.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{item.daily_orders || 0} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.total_revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">Avg: ${item.avg_order_value?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No order analytics available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h2>
          {productAnalytics.length > 0 ? (
            <div className="space-y-4">
              {productAnalytics.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.p_name}</p>
                      <p className="text-sm text-gray-600">{product.total_sold || 0} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.total_revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">${product.price || '0.00'} each</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No product analytics available</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
          <p className="text-3xl font-bold mb-2">${getTotalRevenue().toLocaleString()}</p>
          <p className="text-blue-100">
            {orderAnalytics.length > 0 ? `Across ${orderAnalytics.length} periods` : 'No data available'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Performance</h3>
          <p className="text-3xl font-bold mb-2">{productAnalytics.length}</p>
          <p className="text-emerald-100">
            {productAnalytics.length > 0 ? 'Products generating revenue' : 'No products tracked'}
          </p>
        </div>
      </div>
    </div>
  );
}