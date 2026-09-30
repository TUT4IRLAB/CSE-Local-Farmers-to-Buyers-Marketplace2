import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

const ProductGrid: React.FC = () => {
  const { filteredProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-bold text-secondary-900">No products found</h3>
        <p className="text-secondary-500">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onDetailClick={(p) => setSelectedProduct(p)}
          />
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
