import React from 'react';
import { useProducts } from '../../context/ProductContext';

const ProductManagementTable: React.FC = () => {
  const { products } = useProducts();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-secondary-900">Manage Catalog</h3>
        <span className="text-sm text-secondary-500">{products.length} products across all farmers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 text-secondary-500 font-medium">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Farmer</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <span className="font-bold text-secondary-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-secondary-500">{p.farmerName || '—'}</td>
                <td className="px-6 py-4 text-secondary-500">{p.category}</td>
                <td className="px-6 py-4 font-medium text-secondary-900">R{p.price.toFixed(2)} / {p.unit}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagementTable;
