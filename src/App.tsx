import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Warehouses from './pages/Warehouses';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="categories" element={<ProtectedRoute requiredRole={['Admin', 'Manager']}><Categories /></ProtectedRoute>} />
              <Route path="suppliers" element={<ProtectedRoute requiredRole={['Admin', 'Manager']}><Suppliers /></ProtectedRoute>} />
              <Route path="warehouses" element={<ProtectedRoute requiredRole={['Admin', 'Manager']}><Warehouses /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredRole={['Admin']}><Users /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute requiredRole={['Admin', 'Manager']}><Analytics /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;