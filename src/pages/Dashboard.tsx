import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import { Package, ShoppingCart, DollarSign, TrendingUp, Users, Warehouse } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const { apiCall } = useApi();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        apiCall('/products'),
        apiCall('/orders'),
        hasRole(['Admin']) ? apiCall('/users') : Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      ]);

      const [products, orders, users] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        usersRes.json()
      ]);

      const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0) : 0;

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue,
        totalUsers: Array.isArray(users) ? users.length : 0,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        topProducts: Array.isArray(products) ? products.slice(0, 5) : []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          color="bg-blue-600"
          trend="+12% from last month"
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="bg-emerald-600"
          trend="+5% from last week"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="bg-purple-600"
          trend="+18% from last month"
        />
        {hasRole(['Admin']) && (
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            color="bg-orange-600"
            trend="+3 new this week"
          />
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-600">{order.user_name || 'Customer'}</p>
                      <p className="text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.amount?.toFixed(2) || '0.00'}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders found</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          </div>
          <div className="p-6">
            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.p_name}</p>
                      <p className="text-sm text-gray-600">{product.category_name || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.price || '0.00'}</p>
                      <p className="text-sm text-gray-500">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No products found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Package className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Add New Product</p>
            <p className="text-sm text-gray-600">Create a new product listing</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
            <ShoppingCart className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="font-medium text-gray-900">Process Order</p>
            <p className="text-sm text-gray-600">Create a new customer order</p>
          </button>
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <Warehouse className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Stock Update</p>
            <p className="text-sm text-gray-600">Adjust inventory levels</p>
          </button>
        </div>
      </div>
    </div>
  );
}