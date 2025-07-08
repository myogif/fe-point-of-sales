import React from 'react';
import { BarChart3, DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { formatPrice } from '../utils/priceFormatter';

const Dashboard = () => {
  const stats = [
    { icon: DollarSign, label: 'Daily Sales', value: 'Rp 2,456,000', change: '+12%', color: 'text-green-600' },
    { icon: Package, label: 'Products Sold', value: '234', change: '+8%', color: 'text-blue-600' },
    { icon: Users, label: 'Customers', value: '89', change: '+15%', color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Revenue', value: 'Rp 18,234,000', change: '+18%', color: 'text-orange-600' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Transaction #{1000 + i}</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(125000 + i * 25000)}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: 'Fresh Spinach', sold: 45, revenue: 675000 },
              { name: 'Red Tomatoes', sold: 38, revenue: 304000 },
              { name: 'Bananas', sold: 32, revenue: 384000 },
              { name: 'Apples', sold: 28, revenue: 700000 },
              { name: 'Carrots', sold: 25, revenue: 175000 }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sold} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;