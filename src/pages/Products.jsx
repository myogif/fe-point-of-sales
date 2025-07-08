import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Package, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import { formatPrice } from '../utils/priceFormatter';
import ProductModal from '../components/ProductModal';
import toast from 'react-hot-toast';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productsAPI.delete(productId);
        
        // Refresh data from API after deletion instead of local filtering
        await fetchProducts(false);
        
        toast.success('Product deleted successfully');
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to delete product';
        toast.error(message);
      }
    }
  };

  const handleModalSuccess = async () => {
    // Refresh data from API after add/edit
    await fetchData(false);
    toast.success('Product data updated successfully');
  };

  const getProductPrices = (product) => {
    const prices = [];
    
    // Show prices based on what's actually available for this product
    if (product.price_kg > 0) prices.push(`${formatPrice(product.price_kg)}/kg`);
    if (product.price_ons > 0) prices.push(`${formatPrice(product.price_ons)}/ons`);
    if (product.price_pcs > 0) prices.push(`${formatPrice(product.price_pcs)}/pcs`);
    if (product.price_liter > 0) prices.push(`${formatPrice(product.price_liter)}/liter`);
    
    // If no prices found, show the primary unit type
    if (prices.length === 0) {
      switch(product.unit_type) {
        case 'pcs':
          prices.push(`${formatPrice(product.price_pcs)}/pcs`);
          break;
        case 'kg':
          prices.push(`${formatPrice(product.price_kg)}/kg`);
          break;
        case 'liter':
          prices.push(`${formatPrice(product.price_liter)}/liter`);
          break;
        default:
          prices.push('Price not set');
      }
    }
    
    return prices;
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
            onClick={() => fetchData()}
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">Manage your product inventory (Live Data)</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleAddProduct}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.inStock}</h3>
                <p className="text-sm text-gray-600">In Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.lowStock}</h3>
                <p className="text-sm text-gray-600">Low Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Prices</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Stock</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Barcode</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(product.category_id) }}
                      >
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm space-y-1">
                        {getProductPrices(product).map((price, index) => (
                          <div key={index} className="text-gray-900">{price}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          product.stock <= 5 ? 'text-red-600' :
                          product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.barcode}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.total > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
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
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Products;
