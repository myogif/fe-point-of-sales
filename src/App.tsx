import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Credits from './pages/Credits';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import AddProductForm from './components/AddProductForm';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SidebarProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<POS />} />
                <Route path="dashboard" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </RoleProtectedRoute>
                } />
                <Route path="products" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Products />
                  </RoleProtectedRoute>
                } />
                <Route path="products/add" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AddProductForm />
                  </RoleProtectedRoute>
                } />
                <Route path="products/edit/:id" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AddProductForm />
                  </RoleProtectedRoute>
                } />
                <Route path="categories" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Categories />
                  </RoleProtectedRoute>
                } />
                <Route path="purchases" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Purchases />
                  </RoleProtectedRoute>
                } />
                <Route path="customers" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Customers />
                  </RoleProtectedRoute>
                } />
                <Route path="credit" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Credits />
                  </RoleProtectedRoute>
                } />
                <Route path="transactions" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Transactions />
                  </RoleProtectedRoute>
                } />
                <Route path="reports" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Reports />
                  </RoleProtectedRoute>
                } />
                <Route path="settings" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </RoleProtectedRoute>
                } />
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </SidebarProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
