import React from 'react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-600" size={24} />
            <h3 className="text-xl font-bold text-secondary-900">Your Cart</h3>
            <span className="ml-2 px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs font-bold rounded-full">
              {cartCount} items
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary-100 text-secondary-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="bg-secondary-100 p-6 rounded-full">
                <ShoppingBag size={48} className="text-secondary-400" />
              </div>
              <div>
                <p className="font-bold text-secondary-900">Your cart is empty</p>
                <p className="text-sm text-secondary-500">Start adding some fresh produce!</p>
              </div>
              <Link
                to="/products"
                onClick={onClose}
                className="btn-primary px-8 py-2"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            cart.map(item => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-secondary-100 bg-secondary-50 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-secondary-500">
                <span>Subtotal</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-secondary-900 pt-2 border-t border-secondary-200">
                <span>Total</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="btn-secondary flex-1 py-3 text-sm"
              >
                Clear All
              </button>
              <Link
                to="/checkout"
                onClick={onClose}
                className="btn-primary flex-2 py-3 px-8 flex items-center justify-center gap-2 text-sm font-bold"
              >
                Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
