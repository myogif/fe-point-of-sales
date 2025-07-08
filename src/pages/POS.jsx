import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Menu, Camera, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import CartSidebar from '../components/CartSidebar';
import BarcodeScanner from '../components/BarcodeScanner';
import { productsAPI, categoriesAPI } from '../services/api';
import { useSidebar } from '../context/SidebarContext';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const POS = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async (page = 1, category = 'all', search = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 12, category_id: category === 'all' ? '' : category, search };
      const response = await productsAPI.getAll(params);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, searchTerm);
  }, [fetchProducts, currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll({ limit: 50 });
        setCategories([{ id: 'all', name: 'All' }, ...response.data.data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleBarcodeScan = useCallback(async (barcode) => {
    setIsScannerOpen(false);
    try {
      const response = await productsAPI.getAll({ search: barcode, limit: 1 });
      const product = response.data.data[0];
      if (product) {
        addToCart(product);
      } else {
        toast.error('Product not found!');
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      toast.error('Error finding product.');
    }
  }, [addToCart]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="text-gray-500 mr-4 lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Point of Sale</h1>
            </div>
            <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
            <p className="hidden md:block text-sm text-gray-500">Toko Kelontong Bahagia</p>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Categories */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="px-4 sm:px-6 py-3 overflow-x-auto">
                <div className="flex space-x-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-blue-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Product Grid */}
            <main className="flex-1 p-4 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {pagination && products.length > 0 && (
                <div className="flex items-center justify-center mt-6 sm:mt-8">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 mx-1 rounded-md bg-white border border-gray-300 disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700 mx-2 sm:mx-4">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="p-2 mx-1 rounded-md bg-white border border-gray-300 disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* Cart Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-gray-200 flex-col absolute lg:relative inset-y-0 right-0 transform transition-transform duration-300 ease-in-out translate-x-full lg:translate-x-0">
            <CartSidebar />
          </div>
        </div>
      </div>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl h-full md:h-auto md:max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Scan Barcode</h2>
              <button onClick={() => setIsScannerOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow p-4">
              {isScannerOpen && (
                <BarcodeScanner
                  onScan={handleBarcodeScan}
                  onClose={() => setIsScannerOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
