import React from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onAuthOpen: () => void;
  onCartOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthOpen, onCartOpen }) => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
          <div className="bg-primary-600 text-white p-1 rounded-lg">
            <ShoppingCart size={20} />
          </div>
          <span>Farmer Market</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
            <input
              type="text"
              placeholder="Search fresh produce..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/products" className="hidden md:block text-sm font-medium text-secondary-600 hover:text-primary-600">Products</Link>

          <div className="relative cursor-pointer group" onClick={onCartOpen}>
            <ShoppingCart className="text-secondary-600 group-hover:text-primary-600 transition-colors" size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-4 border-l border-secondary-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-secondary-900 leading-none">{user?.fullName}</p>
                <p className="text-[10px] text-secondary-500">{user?.role}</p>
              </div>
              <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src={user?.avatarUrl} className="w-8 h-8 rounded-full ring-2 ring-primary-100" alt="profile" />
              </Link>
              <button
                onClick={logout}
                className="text-xs font-medium text-secondary-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthOpen}
              className="btn-primary text-sm px-6 py-2"
            >
              Login
            </button>
          )}

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-secondary-200 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <Link to="/" className="font-medium text-secondary-600">Home</Link>
          <Link to="/products" className="font-medium text-secondary-600">Products</Link>
          {user?.role === 'admin' && <Link to="/admin" className="font-medium text-primary-600">Admin Dashboard</Link>}
        </div>
      )}
    </header>
  );
};

export default Header;
