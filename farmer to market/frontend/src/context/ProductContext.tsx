import React, { createContext, useContext, useState } from 'react';
import { Product, Category } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  filteredProducts: Product[];
  setFilter: (category: string | 'All') => void;
  setSearch: (query: string) => void;
  setSort: (sortType: 'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest') => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [filter, setFilterState] = useState('All');
  const [search, setSearchState] = useState('');
  const [sort, setSortState] = useState<'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest'>('Newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);

  React.useEffect(() => {
    let result = [...products];

    if (filter !== 'All') {
      result = result.filter(p => p.category === filter);
    }

    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    }

    switch (sort) {
      case 'PriceAsc': result.sort((a, b) => a.price - b.price); break;
      case 'PriceDesc': result.sort((a, b) => b.price - a.price); break;
      case 'Rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'Newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }

    setFilteredProducts(result);
  }, [filter, search, sort, products]);

  const setFilter = (category: string | 'All') => setFilterState(category);
  const setSearch = (query: string) => setSearchState(query);
  const setSort = (sortType: 'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest') => setSortState(sortType);

  return (
    <ProductContext.Provider value={{ products, categories, filteredProducts, setFilter, setSearch, setSort }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
