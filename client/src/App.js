import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';

import ModernHeader from './components/ModernHeader';
import ModernFooter from './components/ui/ModernFooter';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UniversalLoader from './components/ui/UniversalLoader';
import './App.css';

// Lazy load pages for better performance
const ModernHome = lazy(() => import('./pages/ModernHome'));
const ModernProducts = lazy(() => import('./pages/ModernProducts'));
const ModernProductDetail = lazy(() => import('./pages/ModernProductDetail'));
const ModernCart = lazy(() => import('./pages/ModernCart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminDiscounts = lazy(() => import('./pages/admin/Discounts'));
const HomepageEditor = lazy(() => import('./pages/admin/HomepageEditor'));
const EmailSettings = lazy(() => import('./pages/admin/EmailSettings'));
const ContactManagement = lazy(() => import('./pages/admin/ContactManagement'));


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Suspense fallback={<UniversalLoader />}>
          <Routes>
            {/* Public Routes with Header/Footer */}
            <Route path="/" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <ModernHome />
                </main>
                <ModernFooter />
              </>
            } />
            <Route path="/products" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <ModernProducts />
                </main>
                <ModernFooter />
              </>
            } />
            <Route path="/products/:slug" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <ModernProductDetail />
                </main>
                <ModernFooter />
              </>
            } />
            <Route path="/login" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Login />
                </main>
                <ModernFooter />
              </>
            } />
            <Route path="/register" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Register />
                </main>
                <ModernFooter />
              </>
            } />
            <Route path="/contact" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Contact />
                </main>
                <ModernFooter />
              </>
            } />

            {/* Cart Route - accessible without login */}
            <Route path="/cart" element={
              <>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <ModernCart />
                </main>
                <ModernFooter />
              </>
            } />

            {/* Protected Routes with Header/Footer */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Checkout />
                </main>
                <ModernFooter />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Profile />
                </main>
                <ModernFooter />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Orders />
                </main>
                <ModernFooter />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <OrderDetail />
                </main>
                <ModernFooter />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <ModernHeader />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                  <Wishlist />
                </main>
                <ModernFooter />
              </ProtectedRoute>
            } />

            {/* Admin Routes without Header/Footer */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/discounts" element={<AdminRoute><AdminDiscounts /></AdminRoute>} />
            <Route path="/admin/homepage" element={<AdminRoute><HomepageEditor /></AdminRoute>} />
            <Route path="/admin/email-settings" element={<AdminRoute><EmailSettings /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><ContactManagement /></AdminRoute>} />
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;