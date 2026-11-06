import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { ProductInput, FALLBACK_IMAGE } from '../../services/mappers';

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Dairy & Eggs', 'Honey & Jams', 'Grains & Nuts', 'Meat', 'Other'];
const UNIT_OPTIONS = ['kg', 'bunch', 'dozen', 'jar', 'loaf', 'packet', 'unit'];

const emptyForm = (): ProductInput => ({
  name: '',
  description: '',
  price: 0,
  unit: 'kg',
  stock_quantity: 0,
  category: 'Vegetables',
  image_url: FALLBACK_IMAGE,
});

const FarmerProductList: React.FC = () => {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const myProducts = products.filter((p) => p.farmerId === user?.id);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit || 'kg',
      stock_quantity: p.stock,
      category: p.category,
      image_url: p.image,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateProduct(editingId, form);
      } else {
        await createProduct(form);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server.' : 'Could not save the listing. Please try again.');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Remove "${p.name}" from your listings?`)) return;
    try {
      await deleteProduct(p.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not remove the listing. Please try again.';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
          <Package size={20} className="text-primary-600" /> My Inventory
        </h3>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={18} /> List Produce
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-secondary-900">{editingId ? 'Edit Produce' : 'List New Produce'}</h4>
              <button onClick={() => setShowForm(false)} className="text-secondary-400 hover:text-secondary-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Produce Name</label>
                <input type="text" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Description</label>
                <textarea className="input-field h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Price (R)</label>
                  <input type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Unit</label>
                  <select className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Stock Quantity</label>
                  <input type="number" min="0" className="input-field" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1">Image URL</label>
                <input type="url" className="input-field" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} required />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-3 w-24 h-24 rounded-xl object-cover border border-secondary-200" />
                )}
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">{error}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {editingId ? 'Save Changes' : 'Save Listing'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
        {myProducts.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <AlertCircle size={32} className="mx-auto text-secondary-300 mb-2" />
            <p className="text-sm text-secondary-500">You have no listings yet. Add your first produce!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-50 text-secondary-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Produce</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {myProducts.map(p => (
                  <tr key={p.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <span className="font-bold text-secondary-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-500">{p.category}</td>
                    <td className="px-6 py-4 font-medium text-secondary-900">R{p.price.toFixed(2)} / {p.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(p)} className="text-primary-600 hover:text-primary-700" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p)} className="text-red-400 hover:text-red-600" title="Remove"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProductList;
