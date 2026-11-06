import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiOrder } from '../types';
import api from '../services/api';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const AccountPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    api
      .get('/orders/buyer')
      .then((res) => setOrders(res.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError('Order history is available for buyer accounts.');
        } else {
          setError('Could not load your orders. Please try again later.');
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-secondary-300 mb-4" />
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">You are not signed in</h2>
        <p className="text-secondary-500 mb-8">Sign in from the header to view your account and orders.</p>
        <Link to="/products" className="btn-primary px-8 py-3 inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-24 h-24 rounded-full ring-4 ring-primary-100 overflow-hidden bg-secondary-200">
          <img src={user?.avatarUrl} alt={user?.fullName} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{user?.fullName}</h1>
          <p className="text-secondary-500">
            {user?.email} • {user?.role === 'admin' ? 'Administrator' : user?.role === 'farmer' ? 'Farmer' : 'Valued Customer'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Account Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Name</p>
                <p className="font-medium text-secondary-900">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Email</p>
                <p className="font-medium text-secondary-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Role</p>
                <p className="font-medium text-secondary-900 capitalize">{user?.role}</p>
              </div>
            </div>
            {user?.role === 'farmer' && (
              <Link to="/farmer/dashboard" className="btn-primary w-full py-2 text-sm mt-6 inline-block text-center">
                Go to Farmer Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-primary-600" /> Order History
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 size={32} className="mx-auto text-secondary-300 mb-3 animate-spin" />
                  <p className="text-sm text-secondary-500">Loading your orders...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 opacity-80">
                  <AlertCircle size={32} className="mx-auto text-secondary-300 mb-2" />
                  <p className="text-sm text-secondary-500">{error}</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="p-4 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-secondary-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-secondary-500">
                          {new Date(order.created_at).toLocaleDateString()} • {order.quantity}x {order.product_name || 'Product'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[order.status] || 'bg-secondary-100 text-secondary-600'}`}>
                        {order.status === 'fulfilled' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {order.status}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary-500">Total Amount</span>
                      <span className="font-bold text-secondary-900">R{Number(order.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-60">
                  <Clock size={40} className="mx-auto text-secondary-300 mb-3" />
                  <p className="text-sm text-secondary-500">You haven't placed any orders yet.</p>
                  <Link to="/products" className="btn-secondary px-6 py-2 text-sm mt-4 inline-block">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
