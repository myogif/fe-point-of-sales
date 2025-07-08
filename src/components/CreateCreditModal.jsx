import React, { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { customersAPI, creditsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateCreditModal = ({ onClose, onSuccess, cartTotal = 0 }) => {
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amountOwed, setAmountOwed] = useState(cartTotal.toString());
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const response = await customersAPI.getAll({
        search: customerSearchTerm,
        page: currentPage,
        limit: 5,
      });
      setCustomers(response.data.data || response.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers.');
    } finally {
      setLoadingCustomers(false);
    }
  }, [customerSearchTerm, currentPage]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchCustomers]);

  useEffect(() => {
    setAmountOwed(cartTotal.toString());
  }, [cartTotal]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.name);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer || !selectedCustomer.id) {
      toast.error('Please select a valid customer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditsAPI.createCredit({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        amount_owed: parseFloat(amountOwed),
        due_date: dueDate || null,
        description: description || null,
        type: 'sale_credit', // This is a credit from a sale
      });
      toast.success('Credit created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create credit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Create New Credit</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={customerSearchTerm}
                onChange={(e) => {
                  setCustomerSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter customer name to search"
              />
            </div>
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {loadingCustomers ? (
                <div className="p-2 text-sm text-gray-500 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
                </div>
              ) : customers.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No customers found.</div>
              ) : (
                customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleCustomerSelect(customer)}
                    className={`w-full p-2 text-left text-sm border-b border-gray-200 hover:bg-gray-100 ${
                      selectedCustomer && selectedCustomer.id === customer.id
                        ? 'bg-green-50 text-green-700 font-medium'
                        : ''
                    }`}
                  >
                    {customer.name} {customer.phone && `(${customer.phone})`}
                  </button>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {selectedCustomer && (
              <div className="mt-4 p-3 border border-green-300 rounded-lg bg-green-50 text-green-900 font-medium">
                Selected: {selectedCustomer.name}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Reason for credit, specific items"
            ></textarea>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isSubmitting ? 'Creating...' : 'Create Credit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCreditModal;
