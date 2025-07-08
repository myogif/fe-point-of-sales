import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Calendar, DollarSign } from 'lucide-react';
import { formatPrice } from '../utils/priceFormatter';

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPurchases = [
      {
        id: 1,
        supplier: 'Green Valley Farms',
        total: 2500000,
        items_count: 15,
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        items: [
          { product: 'Fresh Spinach', quantity: 50, unit: 'kg', price: 12000 },
          { product: 'Red Tomatoes', quantity: 30, unit: 'kg', price: 6000 },
        ]
      },
      {
        id: 2,
        supplier: 'Sunrise Produce',
        total: 1800000,
        items_count: 12,
        status: 'pending',
        created_at: '2024-01-14T14:20:00Z',
        items: [
          { product: 'Bananas', quantity: 40, unit: 'kg', price: 10000 },
          { product: 'Apples', quantity: 25, unit: 'kg', price: 20000 },
        ]
      },
      {
        id: 3,
        supplier: 'Local Dairy Co.',
        total: 900000,
        items_count: 8,
        status: 'completed',
        created_at: '2024-01-13T09:15:00Z',
        items: [
          { product: 'Fresh Milk', quantity: 60, unit: 'liter', price: 12000 },
        ]
      }
    ];
    
    setPurchases(mockPurchases);
  }, []);

  const filteredPurchases = purchases.filter(purchase =>
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchases</h1>
            <p className="text-gray-600">Manage your inventory purchases and suppliers</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Purchase</span>
          </button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(purchases.reduce((sum, p) => sum + p.total, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchases.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Purchase ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Supplier</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Items</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPurchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      #{purchase.id.toString().padStart(6, '0')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{purchase.supplier}</p>
                        <p className="text-sm text-gray-500">{purchase.items_count} items</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {purchase.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-gray-600">
                          {item.product} ({item.quantity} {item.unit})
                        </div>
                      ))}
                      {purchase.items.length > 2 && (
                        <div className="text-gray-500">
                          +{purchase.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(purchase.total)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600">No purchases found</p>
          <p className="text-sm text-gray-500 mt-2">Start by creating your first purchase order</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;