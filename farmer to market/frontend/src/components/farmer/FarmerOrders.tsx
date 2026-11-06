import React, { useState } from 'react';
import { Package, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { ApiOrder } from '../../types';
import api from '../../services/api';

interface FarmerOrdersProps {
  orders: ApiOrder[];
  loading: boolean;
  onRefresh: () => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const FarmerOrders: React.FC<FarmerOrdersProps> = ({ orders, loading, onRefresh }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const setStatus = async (id: string, status: ApiOrder['status']) => {
    setUpdatingId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/status`, { status });
      onRefresh();
    } catch {
      setError('Could not update the order. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
          <Package size={20} className="text-primary-600" /> Incoming Orders
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-bold text-secondary-500 hover:text-primary-600 flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">{error}</div>
      )}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={32} className="mx-auto text-secondary-300 mb-2 animate-spin" />
            <p className="text-sm text-secondary-500">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="p-4 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold text-secondary-900">{order.quantity}x {order.product_name || 'Product'}</p>
                  <p className="text-xs text-secondary-500">
                    {order.buyer_name ? `From ${order.buyer_name} • ` : ''}{new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[order.status] || 'bg-secondary-100 text-secondary-600'}`}>
                  {order.status}
                </div>
              </div>
              <div className="text-sm font-medium text-secondary-900 mb-4">
                Total: R{Number(order.total_price).toFixed(2)}
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setStatus(order.id, 'approved')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-2 text-xs font-bold bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setStatus(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-2 text-xs font-bold bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'approved' && (
                  <>
                    <button
                      onClick={() => setStatus(order.id, 'fulfilled')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-2 text-xs font-bold bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Mark Fulfilled
                    </button>
                    <button
                      onClick={() => setStatus(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-2 text-xs font-bold bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {(order.status === 'fulfilled' || order.status === 'cancelled') && (
                  <p className="text-xs text-secondary-400 italic">
                    {order.status === 'fulfilled' ? 'Completed — thank you!' : 'This order was cancelled.'}
                  </p>
                )}
                {updatingId === order.id && <Loader2 size={14} className="animate-spin text-secondary-400" />}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 opacity-60">
            <AlertCircle size={32} className="mx-auto text-secondary-300 mb-2" />
            <p className="text-sm text-secondary-500">No orders yet. Orders appear here once buyers check out.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;
