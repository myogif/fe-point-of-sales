import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { formatPrice } from '../utils/priceFormatter';

const Reports = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [reportData, setReportData] = useState({
    sales: [],
    topProducts: [],
    summary: {}
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockData = {
      sales: [
        { date: '2024-01-15', amount: 2500000, transactions: 45 },
        { date: '2024-01-14', amount: 1800000, transactions: 32 },
        { date: '2024-01-13', amount: 3200000, transactions: 58 },
        { date: '2024-01-12', amount: 2100000, transactions: 38 },
        { date: '2024-01-11', amount: 2800000, transactions: 51 },
        { date: '2024-01-10', amount: 1900000, transactions: 35 },
        { date: '2024-01-09', amount: 2400000, transactions: 42 },
      ],
      topProducts: [
        { name: 'Fresh Spinach', sold: 125, revenue: 1875000 },
        { name: 'Red Tomatoes', sold: 98, revenue: 784000 },
        { name: 'Bananas', sold: 87, revenue: 1044000 },
        { name: 'Apples', sold: 65, revenue: 1625000 },
        { name: 'Carrots', sold: 54, revenue: 378000 },
      ],
      summary: {
        totalRevenue: 16800000,
        totalTransactions: 301,
        averageTransaction: 55814,
        topSellingDay: '2024-01-13'
      }
    };
    
    setReportData(mockData);
  }, [dateRange]);

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      default:
        return 'Last 7 Days';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(reportData.summary.totalRevenue)}
          </h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.summary.totalTransactions}
          </h3>
          <p className="text-sm text-gray-600">Total Transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(reportData.summary.averageTransaction)}
          </h3>
          <p className="text-sm text-gray-600">Avg. Transaction</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">Best Day</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {new Date(reportData.summary.topSellingDay).toLocaleDateString()}
          </h3>
          <p className="text-sm text-gray-600">Top Selling Day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Sales - {getDateRangeLabel()}
          </h3>
          <div className="space-y-4">
            {reportData.sales.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(day.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {day.transactions} transactions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Revenue Growth</h4>
            <p className="text-sm text-gray-600">
              Your revenue has increased by 12% compared to the previous period.
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Customer Activity</h4>
            <p className="text-sm text-gray-600">
              Transaction frequency has improved with more repeat customers.
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Product Performance</h4>
            <p className="text-sm text-gray-600">
              Fresh vegetables are your top-performing category this period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;