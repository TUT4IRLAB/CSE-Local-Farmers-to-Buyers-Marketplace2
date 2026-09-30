import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-secondary-50 border border-secondary-100 group transition-all hover:bg-white hover:shadow-sm">
      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-secondary-200">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-secondary-900 text-sm line-clamp-1">{item.name}</h4>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-secondary-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <p className="text-xs text-secondary-500 mb-3 line-clamp-1">
          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white border border-secondary-200 rounded-lg px-2 py-1">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 rounded hover:bg-secondary-100 text-secondary-600 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded hover:bg-secondary-100 text-secondary-600 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <span className="text-sm font-bold text-secondary-900">
            R{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
