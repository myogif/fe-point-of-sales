import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Package, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCardNew from '../components/ProductCardNew';
import toast from 'react-hot-toast';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

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
      setError('Gagal memuat produk dari server');
      toast.error('Gagal memuat produk');
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
      toast.error('Gagal memuat kategori');
      setCategories([]); // Clear categories on error
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, '');
  }, [fetchProducts, currentPage, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(currentPage, selectedCategory, searchTerm).finally(() => setRefreshing(false));
    toast.success('Data berhasil diperbarui');
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, selectedCategory, searchTerm);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Tidak Diketahui';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (product) => {
    // Pass current page state to maintain position after edit
    const state = {
      returnPage: currentPage,
      returnCategory: selectedCategory,
      returnSearch: searchTerm
    };
    navigate(`/products/edit/${product.id}`, { state });
  };

  const handleDeleteProduct = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    
    try {
      await productsAPI.delete(deleteModal.product.id);
      
      // Refresh data from API after deletion maintaining current state
      await fetchProducts(currentPage, selectedCategory, searchTerm);
      
      toast.success('Produk berhasil dihapus');
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409 && error.response?.data?.code === 'PRODUCT_IN_USE') {
        toast.error('Tidak dapat menghapus produk karena masih digunakan dalam catatan penjualan');
      } else if (error.response?.status === 404) {
        toast.error('Produk tidak ditemukan. Mungkin sudah dihapus.');
        // Refresh the list to remove the non-existent product
        await fetchProducts(currentPage, selectedCategory, searchTerm);
      } else {
        const message = error.response?.data?.error || error.message || 'Failed to delete product';
        toast.error(message);
      }
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, product: null });
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
          <p className="text-gray-600">Memuat produk dari server...</p>
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
            <p className="text-lg font-medium">Gagal Memuat Produk</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchProducts()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Coba Lagi
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
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-600">Kelola inventaris produk Anda</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-100 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Semua Kategori</option>
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
              ? 'Tidak ada produk yang sesuai dengan kriteria Anda'
              : 'Tidak ada produk ditemukan dalam database'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Produk Pertama Anda</span>
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
              onDelete={() => handleDeleteProduct(product)}
              getCategoryName={getCategoryName}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      )}
      
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between p-4 mt-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm text-gray-700">
            Halaman {pagination.page} dari {pagination.totalPages} (Total: {pagination.total} item)
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hapus Produk
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus "{deleteModal.product?.name}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
