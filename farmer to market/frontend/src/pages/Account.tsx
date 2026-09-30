import React from 'react';
import { Package, MapPin, User, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_ORDERS } from '../data/mockData';

const AccountPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-24 h-24 rounded-full ring-4 ring-primary-100 overflow-hidden bg-secondary-200">
          <img src={user?.avatarUrl} alt={user?.fullName} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{user?.fullName}</h1>
          <p className="text-secondary-500">{user?.email} • {user?.role === 'admin' ? 'Administrator' : 'Valued Customer'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Address */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-600" /> Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-secondary-400 uppercase font-bold mb-1">Phone</p>
                <p className="text-sm font-medium text-secondary-900">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <button className="btn-secondary w-full py-2 text-sm">Edit Profile</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-primary-600" /> Delivery Address
            </h3>
            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100 mb-4">
              <p className="text-sm font-medium text-secondary-900 mb-1">{user?.address?.street}</p>
              <p className="text-sm text-secondary-600">
                {user?.address?.suburb}, {user?.address?.city}<br />
                {user?.address?.province}, {user?.address?.postalCode}
              </p>
            </div>
            <button className="btn-secondary w-full py-2 text-sm">Change Address</button>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-primary-600" /> Order History
            </h3>
            <div className="space-y-4">
              {MOCK_ORDERS.length > 0 ? (
                MOCK_ORDERS.map(order => (
                  <div key={order.id} className="p-4 border border-secondary-100 rounded-xl hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-bold text-secondary-900">Order #{order.id.toUpperCase()}</p>
                        <p className="text-xs text-secondary-500">{order.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                        <CheckCircle2 size={12} /> {order.status}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-secondary-100">
                            <img src={item.image} alt="item" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-secondary-500">Total Amount</p>
                        <p className="text-sm font-bold text-secondary-900">R{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      View Invoice
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-60">
                  <Clock size={40} className="mx-auto text-secondary-300 mb-3" />
                  <p className="text-sm text-secondary-500">You haven't placed any orders yet.</p>
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
