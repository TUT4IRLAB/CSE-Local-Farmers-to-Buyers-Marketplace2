import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertTriangle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockData';
import ProductManagementTable from './ProductManagementTable';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-secondary-200 flex items-center gap-4 shadow-sm">
    <div className={`${color} p-3 rounded-xl text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-medium text-secondary-500 uppercase">{title}</p>
      <h3 className="text-2xl font-bold text-secondary-900">{value}</h3>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-500">Welcome back, Farmer Bob!</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <ShoppingBag size={18} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Revenue" value="$12,450.00" icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Total Orders" value="342" icon={ShoppingBag} color="bg-primary-600" />
        <StatCard title="Active Users" value="1,204" icon={Users} color="bg-purple-500" />
        <StatCard title="Low Stock" value="12 Items" icon={AlertTriangle} color="bg-amber-500" />
      </div>

      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
        <ProductManagementTable />
      </div>
    </div>
  );
};

export default AdminDashboard;
