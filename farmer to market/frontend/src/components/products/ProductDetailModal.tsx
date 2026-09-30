import React, { useState } from 'react';
import { Star, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!isOpen) return null;

  // Set default variants on open
  React.useEffect(() => {
    const defaults: Record<string, string> = {};
    product.variants.forEach(v => {
      defaults[v.name] = v.options[0];
    });
    setSelectedVariants(defaults);
  }, [product]);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedVariants
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-secondary-500 hover:text-secondary-900 transition-colors shadow-sm"
        >
          <XIcon size={20} />
        </button>

        {/* Left Side: Gallery */}
        <div className="w-full md:w-1/2 bg-secondary-50 p-6 flex flex-col justify-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Mock Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${i === 1 ? 'border-primary-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveImage(i - 1)}
              >
                <img src={product.image} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider mb-2">
            <span className="bg-primary-100 px-2 py-0.5 rounded">{product.category}</span>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">{product.name}</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-lg">{product.rating}</span>
            </div>
            <span className="text-secondary-400 text-sm">({product.reviewCount} verified reviews)</span>
          </div>

          <p className="text-secondary-600 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="text-4xl font-bold text-secondary-900 mb-8">
            R{product.price}
          </div>

          {/* Variants Selection */}
          <div className="space-y-6 mb-8">
            {product.variants.map(variant => (
              <div key={variant.id}>
                <label className="block text-sm font-bold text-secondary-700 mb-3">{variant.name}</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(option => (
                    <button
                      key={option}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedVariants[variant.name] === option
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                        : 'bg-white border-secondary-200 text-secondary-600 hover:border-primary-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4">
            <div className="flex items-center bg-secondary-100 rounded-xl p-1 border border-secondary-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-bold text-secondary-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-grow btn-primary py-4 flex items-center justify-center gap-2 text-lg font-bold"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small helper since X is a reserved word or needs explicit import
const XIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);

export default ProductDetailModal;
