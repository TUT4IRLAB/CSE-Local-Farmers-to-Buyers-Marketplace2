import React from 'react';
import { ShoppingBag, TrendingUp, Package, Users, MapPin } from 'lucide-react';
import FarmerProductList from './FarmerProductList';
import FarmerOrders from './FarmerOrders';

const FarmerDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Farmer's Portal</h1>
          <p className="text-secondary-500">Welcome back to your farm management suite.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-secondary-200 shadow-sm">
          <MapPin size={18} className="text-primary-600" />
          <span className="text-sm font-bold text-secondary-900">Stellenbosch, Western Cape</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Total Sales</p>
            <h3 className="text-2xl font-bold text-secondary-900">R14,250.00</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Active Listings</p>
            <h3 className="text-2xl font-bold text-secondary-900">12 Items</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase">Customer Reach</p>
            <h3 className="text-2xl font-bold text-secondary-900">450+ Buyers</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FarmerProductList />
        </div>
        <div className="lg:col-span-1">
          <FarmerOrders />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
