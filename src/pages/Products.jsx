import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Package, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCardNew from '../components/ProductCardNew';
import toast from 'react-hot-toast';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, category = 'all', search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        category_id: category === 'all' ? '' : category,
        search,
      };
      const response = await productsAPI.getAll(params);
      if (response && response.data) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Invalid response format from products API');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products from server');
      toast.error('Failed to fetch products');
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      // Fetch all categories for the dropdown, not just a paginated list
      const response = await categoriesAPI.getAll({ limit: 999 });
      
      if (response && response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        throw new Error('Invalid response format from categories API');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]); // Clear categories on error
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, searchTerm);
  }, [fetchProducts, currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(currentPage, selectedCategory, searchTerm).finally(() => setRefreshing(false));
    toast.success('Data refreshed successfully');
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productsAPI.delete(productId);
        
        // Refresh data from API after deletion maintaining current state
        await fetchProducts(currentPage, selectedCategory, searchTerm);
        
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        
        // Handle specific error cases
        if (error.response?.status === 409 && error.response?.data?.code === 'PRODUCT_IN_USE') {
          toast.error('Cannot delete product as it is referenced in sales records');
        } else if (error.response?.status === 404) {
          toast.error('Product not found. It may have already been deleted.');
          // Refresh the list to remove the non-existent product
          await fetchProducts(currentPage, selectedCategory, searchTerm);
        } else {
          const message = error.response?.data?.error || error.message || 'Failed to delete product';
          toast.error(message);
        }
      }
    }
  };

  // Calculate stats from live data
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    lowStock: products.filter(p => p.stock <= 5).length
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products from server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-medium">Error Loading Products</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchProducts()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-100 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'No products found matching your criteria'
              : 'No products found in database'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCardNew
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              getCategoryName={getCategoryName}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      )}
      
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between p-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total} items)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
