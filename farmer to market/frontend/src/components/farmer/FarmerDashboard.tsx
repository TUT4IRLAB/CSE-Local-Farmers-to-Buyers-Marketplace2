import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, Inbox, Coins, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { ApiOrder } from '../../types';
import api from '../../services/api';
import FarmerProductList from './FarmerProductList';
import FarmerOrders from './FarmerOrders';

const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const myProducts = products.filter((p) => p.farmerId === user?.id);

  const loadOrders = () => {
    setLoadingOrders(true);
    api
      .get('/orders/farmer')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(loadOrders, []);

  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const orderValue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Farmer's Portal</h1>
          <p className="text-secondary-500">Welcome back, {user?.fullName}.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-secondary-200 shadow-sm">
          <MapPin size={18} className="text-primary-600" />
          <span className="text-sm font-bold text-secondary-900">{user?.fullName}'s Farm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Active Listings</p>
            <h3 className="text-2xl font-bold text-secondary-900">{myProducts.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Stock Units</p>
            <h3 className="text-2xl font-bold text-secondary-900">{totalStock}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Inbox size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Pending Orders</p>
            <h3 className="text-2xl font-bold text-secondary-900">{pendingCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Order Value</p>
            <h3 className="text-2xl font-bold text-secondary-900">R{orderValue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FarmerProductList />
        </div>
        <div className="lg:col-span-1">
          <FarmerOrders orders={orders} loading={loadingOrders} onRefresh={loadOrders} />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
