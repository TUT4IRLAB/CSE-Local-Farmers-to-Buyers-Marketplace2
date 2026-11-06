import React from 'react';
import { TrendingUp, Store, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
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
  const { products } = useProducts();
  const { user } = useAuth();

  const farmerCount = new Set(products.map((p) => p.farmerId)).size;
  const lowStock = products.filter((p) => p.stock < 10).length;
  const catalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-500">Welcome back, {user?.fullName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Catalog Value" value={`R${catalogValue.toFixed(2)}`} icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Total Products" value={String(products.length)} icon={ShoppingBag} color="bg-primary-600" />
        <StatCard title="Registered Farmers" value={String(farmerCount)} icon={Store} color="bg-purple-500" />
        <StatCard title="Low Stock Items" value={`${lowStock} Items`} icon={AlertTriangle} color="bg-amber-500" />
      </div>

      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
        <ProductManagementTable />
      </div>
    </div>
  );
};

export default AdminDashboard;
