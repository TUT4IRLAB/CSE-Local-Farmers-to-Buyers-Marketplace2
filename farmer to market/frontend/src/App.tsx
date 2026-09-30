import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProductGrid from './components/products/ProductGrid';
import ProductFilter from './components/products/ProductFilter';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/auth/AuthModal';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutFlow from './components/cart/CheckoutFlow';
import AccountPage from './pages/Account';
import FarmerDashboard from './components/farmer/FarmerDashboard';
import { useAuth } from './context/AuthContext';

// Simple Page Components since we are building incrementally
const Home = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="bg-primary-600 rounded-3xl p-8 md:p-16 text-white mb-12 relative overflow-hidden">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Fresh From the Farm, Delivered to Your Door</h1>
        <p className="text-lg opacity-90 mb-8">Support local farmers and enjoy the healthiest, organic produce grown with love and care.</p>
        <button className="bg-white text-primary-700 px-8 py-3 rounded-full font-bold hover:bg-secondary-100 transition-colors">
          Shop Now
        </button>
      </div>
      <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 hidden md:block">
        <img src="https://images.unsplash.com/photo-1464226184884-fa280b8f7356?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="farm" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <ProductFilter />
      </div>
      <div className="lg:col-span-3">
        <ProductGrid />
      </div>
    </div>
  </div>
);

const ProductsPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h2 className="text-3xl font-bold mb-8">All Products</h2>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <ProductFilter />
      </div>
      <div className="lg:col-span-3">
        <ProductGrid />
      </div>
    </div>
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="p-8 text-center">Access Denied. Admin privileges required.</div>;
  }
  return <>{children}</>;
};

const FarmerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.role !== 'farmer') {
    return <div className="p-8 text-center">Access Denied. Farmer account required.</div>;
  }
  return <>{children}</>;
};

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header onAuthOpen={() => setIsAuthOpen(true)} onCartOpen={() => setIsCartOpen(true)} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/checkout" element={<CheckoutFlow onComplete={() => window.location.href = '/'} />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/farmer/dashboard" element={
                    <FarmerRoute>
                      <FarmerDashboard />
                    </FarmerRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
              <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
          </Router>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
