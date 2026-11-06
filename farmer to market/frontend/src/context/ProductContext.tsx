import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../types';
import api from '../services/api';
import { toUiProduct, ProductInput, FALLBACK_IMAGE } from '../services/mappers';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  filteredProducts: Product[];
  loading: boolean;
  error: string;
  setFilter: (category: string | 'All') => void;
  setSearch: (query: string) => void;
  setSort: (sortType: 'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest') => void;
  refresh: () => Promise<void>;
  createProduct: (data: ProductInput) => Promise<void>;
  updateProduct: (id: string, data: ProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export { FALLBACK_IMAGE };

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilterState] = useState('All');
  const [search, setSearchState] = useState('');
  const [sort, setSortState] = useState<'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest'>('Newest');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products');
      setProducts(res.data.map(toUiProduct));
    } catch (err: any) {
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Cannot reach the backend API. Make sure it is running on http://localhost:5000.'
          : 'Failed to load products from the server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const categories: Category[] = React.useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category))).sort();
    return names.map((name, i) => ({ id: `cat${i}`, name, icon: 'leaf', image: '' }));
  }, [products]);

  React.useEffect(() => {
    let result = [...products];

    if (filter !== 'All') {
      result = result.filter((p) => p.category === filter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'PriceAsc': result.sort((a, b) => a.price - b.price); break;
      case 'PriceDesc': result.sort((a, b) => b.price - a.price); break;
      case 'Rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'Newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }

    setFilteredProducts(result);
  }, [filter, search, sort, products]);

  const createProduct = async (data: ProductInput) => {
    await api.post('/products', data);
    await refresh();
  };

  const updateProduct = async (id: string, data: ProductInput) => {
    await api.put(`/products/${id}`, data);
    await refresh();
  };

  const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
    await refresh();
  };

  const setFilter = (category: string | 'All') => setFilterState(category);
  const setSearch = (query: string) => setSearchState(query);
  const setSort = (sortType: 'PriceAsc' | 'PriceDesc' | 'Rating' | 'Newest') => setSortState(sortType);

  return (
    <ProductContext.Provider
      value={{
        products, categories, filteredProducts, loading, error,
        setFilter, setSearch, setSort, refresh,
        createProduct, updateProduct, deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
