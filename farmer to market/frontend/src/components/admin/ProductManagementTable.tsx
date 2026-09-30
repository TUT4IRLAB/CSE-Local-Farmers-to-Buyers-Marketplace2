import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../../context/ProductContext';

const ProductManagementTable: React.FC = () => {
  const { products } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1566385101042-1a07a6fd853e?auto=format&fit=crop&q=80&w=800',
    stock: 0,
    rating: 5,
    reviewCount: 0,
    variants: [],
    createdAt: new Date().toISOString().split('T')[0],
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Product Added! (Simulation: In a real app, this would call the API and update ProductContext)');
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Product Updated! (Simulation: In a real app, this would call the API and update ProductContext)');
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-secondary-900">Manage Catalog</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Add Product Modal Simulation */}
      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-secondary-900">Add New Product</h4>
              <button onClick={() => setShowAddForm(false)} className="text-secondary-400 hover:text-secondary-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Description</label>
                  <textarea
                    className="input-field h-24"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Price (R)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Stock Level</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Save size={18} /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-50 text-secondary-500 font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                  <td className="px-6 py-4 text-secondary-500">{p.category}</td>
                  <td className="px-6 py-4 font-medium text-secondary-900">R{p.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                      onClick={() => alert(`Product ${p.name} deleted!`)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal Simulation */}
      {editingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-secondary-900">Edit Product</h4>
              <button onClick={() => setEditingProduct(null)} className="text-secondary-400 hover:text-secondary-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Price (R)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementTable;
