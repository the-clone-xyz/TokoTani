import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FrontendLayout from './layouts/FrontendLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSales from './pages/admin/AdminSales';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen font-sans text-gray-900 flex flex-col relative z-0 bg-gray-50">
              {/* SVG Grid Background */}
              <div className="fixed inset-0 z-[-1] pointer-events-none bg-gray-50">
              <svg 
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                  </pattern>
                  <radialGradient id="glow-top-left" cx="20%" cy="20%" r="60%">
                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="glow-bottom-right" cx="80%" cy="80%" r="60%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" className="text-emerald-900" />
                <rect width="100%" height="100%" fill="url(#glow-top-left)" />
                <rect width="100%" height="100%" fill="url(#glow-bottom-right)" />
              </svg>
            </div>
            
            <Routes>
              {/* Frontend Routes */}
              <Route path="/" element={<FrontendLayout />}>
                <Route index element={<HomePage />} />
                <Route path="product/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/products" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="sales" element={<AdminSales />} />
              </Route>
            </Routes>
            
          </div>
        </Router>
      </CartProvider>
    </ProductProvider>
    </AuthProvider>
  );
}
