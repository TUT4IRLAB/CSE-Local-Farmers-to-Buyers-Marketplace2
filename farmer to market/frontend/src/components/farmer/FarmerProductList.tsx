import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { Product } from '../types';
import { useProducts } from '../../context/ProductContext';

const FarmerProductList: React.FC = () => {
  const { products } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Produce listed successfully! (Simulation)');
    setShowAddForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
          <Package size={20} className="text-primary-600" /> My Inventory
        </h3>
        <button
          onClick={() => {
            setFormProduct({ name: '', description: '', price: 0, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a07a6fd853e?auto=format&fit=crop&q=80&w=800', stock: 0, rating: 5, reviewCount: 0, variants: [], createdAt: new Date().toISOString().split('T')[0] });
            setShowAddForm(true);
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={18} /> List Produce
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-secondary-900">{editingProduct ? 'Edit Produce' : 'List New Produce'}</h4>
              <button onClick={() => { setShowAddForm(false); setEditingProduct(null); }} className="text-secondary-400 hover:text-secondary-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Produce Name</label>
                  <input type="text" className="input-field" value={formProduct.name} onChange={e => setFormProduct({ ...formProduct, name: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Description</label>
                  <textarea className="input-field h-24" value={formProduct.description} onChange={e => setFormProduct({ ...formProduct, description: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Price (R/unit)</label>
                  <input type="number" className="input-field" value={formProduct.price} onChange={e => setFormProduct({ ...formProduct, price: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Stock (kg/units)</label>
                  <input type="number" className="input-field" value={formProduct.stock} onChange={e => setFormProduct({ ...formProduct, stock: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); }} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Save size={18} /> Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 text-secondary-500 font-medium">
            <tr>
              <th className="px-6 py-4">Produce</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <span className="font-bold text-secondary-900">{p.name}</span>
                </td>
                <td className="px-6 py-4 font-medium text-secondary-900">R{p.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => { setEditingProduct(p); setFormProduct(p); setShowAddForm(true); }} className="text-primary-600 hover:text-primary-700"><Edit2 size={16} /></button>
                  <button onClick={() => alert('Produce removed!')} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FarmerProductList;
