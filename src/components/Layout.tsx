import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tags, 
  Truck, 
  Warehouse, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'User'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['Admin', 'Manager', 'User'] },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['Admin', 'Manager', 'User'] },
    { name: 'Categories', href: '/categories', icon: Tags, roles: ['Admin', 'Manager'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['Admin', 'Manager'] },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse, roles: ['Admin', 'Manager'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['Admin'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['Admin', 'Manager'] },
  ].filter(item => hasRole(item.roles));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-900/80 ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`} 
             onClick={() => setSidebarOpen(false)} />
        <div className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Inventory Pro</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-72 lg:bg-white lg:shadow-sm lg:flex lg:flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Inventory Pro</h2>
          <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Inventory Pro</h1>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}