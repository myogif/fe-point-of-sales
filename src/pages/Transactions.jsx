import React, { useState, useEffect } from 'react';
import { salesAPI, creditsAPI } from '../services/api';
import { formatPrice } from '../utils/priceFormatter';
import { 
  List, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Package,
  User,
  Calendar,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <List className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'credit':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      default:
        return <List className="w-5 h-5 text-gray-600" />;
    }
  };

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

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
              <p className="text-gray-600">Transaction #{transaction.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Transaction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Date & Time</p>
                  <p className="text-sm font-semibold text-blue-900">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-700">
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-lg font-bold text-green-900">{formatPrice(transaction.total)}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {getPaymentMethodIcon(transaction.payment_method)}
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Payment Method</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.payment_method)}`}>
                    {transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Cashier</p>
                  <p className="text-sm font-semibold text-orange-900">
                    {transaction.users?.username || 'N/A'}
                  </p>
                  {transaction.customers?.name && (
                    <p className="text-xs text-orange-700">
                      Customer: {transaction.customers.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Sold */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Products Sold</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {transaction.sale_details?.length || 0} items
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Product</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Quantity</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Unit</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Unit Price</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaction.sale_details?.length > 0 ? (
                    transaction.sale_details.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={detail.products?.image_url || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={detail.products?.name || 'Product'}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {detail.products?.name || 'Unknown Product'}
                              </p>
                              {detail.products?.barcode && (
                                <p className="text-sm text-gray-500">
                                  #{detail.products.barcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {parseFloat(detail.quantity).toFixed(detail.unit_type === 'pcs' ? 0 : 1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {detail.unit_type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {formatPrice(detail.unit_price)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-green-600">
                            {formatPrice(detail.total)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No product details available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Transaction Total */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Items: {transaction.sale_details?.reduce((sum, detail) => sum + parseFloat(detail.quantity), 0).toFixed(1) || 0}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Transaction Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(transaction.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalCreditToday, setTotalCreditToday] = useState(0);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    payment_method: '',
  });

  useEffect(() => {
    fetchTransactionsAndCredits();
  }, [filters]);

  const fetchTransactionsAndCredits = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        payment_method: filters.payment_method,
      };
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDateString = `${year}-${month}-${day}`;

      const [transactionsResponse, totalCreditResponse] = await Promise.all([
        salesAPI.getAll(params),
        creditsAPI.getTotalOutstanding({ startDate: todayDateString, endDate: todayDateString })
      ]);
      setTransactions(transactionsResponse.data);
      setTotalCreditToday(totalCreditResponse.data.total_outstanding);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <List className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'credit':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      default:
        return <List className="w-5 h-5 text-gray-600" />;
    }
  };

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

  // Calculate summary stats
  const stats = {
    total: transactions.length,
    totalAmount: transactions.reduce((sum, tx) => sum + parseFloat(tx.total), 0),
    completed: transactions.filter(tx => tx.status === 'completed').length,
    // The "pending" stat will now represent "Total Credit Today"
    totalCreditToday: totalCreditToday, 
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600">View all sales and credit transactions with detailed product information.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <List className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalAmount)}</h3>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalCreditToday)}</h3>
              <p className="text-sm text-gray-600">Total Credit Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="payment_method"
              value={filters.payment_method}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date & Time</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Payment Method</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Cashier</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Items</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <List className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 mb-2">No transactions found</p>
                    <p className="text-sm text-gray-500">
                      {Object.values(filters).some(f => f) 
                        ? 'Try adjusting your filters' 
                        : 'Transactions will appear here when sales are made'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(tx.total)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(tx.payment_method)}
                        <span className="font-medium text-gray-900">
                          {tx.payment_method.charAt(0).toUpperCase() + tx.payment_method.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tx.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{tx.users?.username || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {tx.sale_details?.length || 0} item{(tx.sale_details?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
