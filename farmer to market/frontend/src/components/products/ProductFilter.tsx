import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { Filter, SortDesc } from 'lucide-react';

const ProductFilter: React.FC = () => {
  const { categories, setFilter, setSearch, setSort } = useProducts();

  return (
    <div className="space-y-8 sticky top-24">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-secondary-900 mb-4">
          <Filter size={18} className="text-primary-600" />
          Categories
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setFilter('All')}
            className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-secondary-200"
          >
            All Produce
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.name)}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-secondary-200"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 font-bold text-secondary-900 mb-4">
          <SortDesc size={18} className="text-primary-600" />
          Sort By
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'Newest First', value: 'Newest' },
            { label: 'Price: Low to High', value: 'PriceAsc' },
            { label: 'Price: High to Low', value: 'PriceDesc' },
            { label: 'Top Rated', value: 'Rating' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSort(option.value as any)}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-secondary-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
