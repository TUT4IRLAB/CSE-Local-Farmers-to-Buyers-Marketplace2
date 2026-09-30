import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onDetailClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDetailClick }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For simplicity in this grid, we use default variants if any
    const selectedVariants: Record<string, string> = {};
    product.variants.forEach(v => {
      selectedVariants[v.name] = v.options[0];
    });

    addToCart({
      ...product,
      quantity: 1,
      selectedVariants
    });
  };

  return (
    <div
      onClick={() => onDetailClick(product)}
      className="group cursor-pointer bg-white rounded-2xl border border-secondary-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-secondary-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            R{product.price}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 text-amber-500 mb-2">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-bold">{product.rating}</span>
          <span className="text-xs text-secondary-400">({product.reviewCount} reviews)</span>
        </div>
        <h3 className="font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-secondary-500 mb-6 line-clamp-2 flex-grow">
          {product.description}
        </p>
        <button
          onClick={handleAddToCart}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          <Plus size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
