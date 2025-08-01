import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Menu, Camera, X, ShoppingCart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProductListItem from '../components/ProductListItem';
import CartSidebar from '../components/CartSidebar';
import CartBar from '../components/CartBar';
import CategoryTabs from '../components/CategoryTabs';
import BarcodeScanner from '../components/BarcodeScanner';
import AddManualItemForm from '../components/AddManualItemForm';
import { productsAPI, categoriesAPI } from '../services/api';
import { useSidebar } from '../context/SidebarContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const POS = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { addToCart } = useCart();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
      toast.error('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, []);

  //   useEffect(() => {
  //   fetchProducts(currentPage, selectedCategory, searchTerm);
  // }, [fetchProducts, currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory, '');
  }, [fetchProducts, currentPage, selectedCategory]);

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll({ limit: 50 });
        setCategories([{ id: 'all', name: 'Semua' }, ...response.data.data]);
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
    
    // Fill the search term with the barcode and trigger search
    setSearchTerm(barcode);
    setCurrentPage(1);
    
    try {
      // Perform search with the barcode
      await fetchProducts(1, selectedCategory, barcode);
      toast.success('Barcode berhasil dipindai dan dicari!');
    } catch (error) {
      console.error('Error searching with barcode:', error);
      toast.error('Gagal mencari dengan barcode.');
    }
  }, [selectedCategory, fetchProducts]);


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
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Kasir</h1>
            </div>
            <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
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
            <div className="flex items-center">
              <p className="hidden md:block text-sm text-gray-500 mr-4">Toko Pak Imam</p>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="lg:hidden text-gray-500"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Categories */}
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(categoryId) => {
                setSelectedCategory(categoryId);
                setCurrentPage(1);
              }}
            />

            {/* Product List */}
            <main className="flex-1 p-4 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3 max-w-3xl mx-auto">
                  {/* Manual Item Input - Moved to top */}
                  <AddManualItemForm />
                  
                  {/* Product List */}
                  {products.map((product) => (
                    <ProductListItem key={product.id} product={product} />
                  ))}
                </div>
              )}

              {pagination && products.length > 0 && (
                <div className="flex items-center justify-center mt-6 sm:mt-8">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 mx-1 rounded-md bg-white border border-gray-300 disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700 mx-2 sm:mx-4">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="p-2 mx-1 rounded-md bg-white border border-gray-300 disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* Cart Sidebar */}
          {isCartOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsCartOpen(false)}
            ></div>
          )}
          <div
            className={`fixed inset-y-0 right-0 z-40 w-full bg-white border-l border-gray-200 flex-col transition-transform duration-300 ease-in-out lg:w-[380px] lg:static lg:translate-x-0 ${
              isCartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <CartSidebar onClose={() => setIsCartOpen(false)} />
          </div>
        </div>
      </div>

      {/* Floating Cart Bar */}
      <CartBar onCheckout={() => setIsCartOpen(true)} />

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-full max-w-2xl h-full md:h-auto md:max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Pindai Barcode</h2>
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
