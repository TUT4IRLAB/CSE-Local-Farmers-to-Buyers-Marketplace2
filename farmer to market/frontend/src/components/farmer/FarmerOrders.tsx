import React from 'react';
import { Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { MOCK_ORDERS } from '../../data/mockData';

const FarmerOrders: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
      <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center gap-2">
        <Package size={20} className="text-primary-600" /> Incoming Orders
      </h3>
      <div className="space-y-4">
        {MOCK_ORDERS.length > 0 ? (
          MOCK_ORDERS.map(order => (
            <div key={order.id} className="p-4 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold text-secondary-900">Order #{order.id.toUpperCase()}</p>
                  <p className="text-xs text-secondary-500">{order.createdAt}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.status}
                </div>
              </div>
              <div className="text-sm text-secondary-600 mb-4">
                {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-xs font-bold bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                  Mark Packed
                </button>
                <button className="flex-1 py-2 text-xs font-bold bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 opacity-60">
            <AlertCircle size={32} className="mx-auto text-secondary-300 mb-2" />
            <p className="text-sm text-secondary-500">No pending orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;
