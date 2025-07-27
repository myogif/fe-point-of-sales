import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Menu, Camera, X, ShoppingCart, Package, Plus } from 'lucide-react';
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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
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
        setScannedProduct(product);
        setIsProductModalOpen(true);
        toast.success('Product found!');
      } else {
        toast.error('Product not found!');
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      toast.error('Error finding product.');
    }
  }, []);

  const handleAddScannedProductToCart = (unit = null) => {
    if (scannedProduct) {
      const defaultUnit = unit || (scannedProduct.price_pcs ? 'pcs' : scannedProduct.price_kg ? 'kg' : 'ons');
      addToCart(scannedProduct, 1, defaultUnit);
      setIsProductModalOpen(false);
      setScannedProduct(null);
      toast.success('Product added to cart!');
    }
  };

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

      {/* Product Display Modal */}
      {isProductModalOpen && scannedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Product Found
              </h2>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setScannedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product Image */}
            {scannedProduct.image_url && (
              <div className="p-4 pb-0">
                <img
                  src={scannedProduct.image_url}
                  alt={scannedProduct.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Product Details */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{scannedProduct.name}</h3>
                {scannedProduct.description && (
                  <p className="text-gray-600 text-sm mt-1">{scannedProduct.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Barcode:</span>
                  <p className="font-medium">{scannedProduct.barcode}</p>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <p className="font-medium">{scannedProduct.stock || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unit Type:</span>
                  <p className="font-medium capitalize">{scannedProduct.unit_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{scannedProduct.category?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Prices */}
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-800 mb-2">Available Prices:</h4>
                <div className="space-y-2">
                  {scannedProduct.price_pcs && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Per Piece:</span>
                      <span className="font-medium">Rp {scannedProduct.price_pcs.toLocaleString()}</span>
                    </div>
                  )}
                  {scannedProduct.price_kg && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Per KG:</span>
                      <span className="font-medium">Rp {scannedProduct.price_kg.toLocaleString()}</span>
                    </div>
                  )}
                  {scannedProduct.price_ons && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Per Ons:</span>
                      <span className="font-medium">Rp {scannedProduct.price_ons.toLocaleString()}</span>
                    </div>
                  )}
                  {scannedProduct.price_liter && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Per Liter:</span>
                      <span className="font-medium">Rp {scannedProduct.price_liter.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setScannedProduct(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleAddScannedProductToCart()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Cart
                </button>
              </div>
              
              {/* Unit Selection Buttons */}
              {(scannedProduct.price_pcs || scannedProduct.price_kg || scannedProduct.price_ons || scannedProduct.price_liter) && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Or add with specific unit:</p>
                  <div className="flex gap-1 flex-wrap">
                    {scannedProduct.price_pcs && (
                      <button
                        onClick={() => handleAddScannedProductToCart('pcs')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Add as Pieces
                      </button>
                    )}
                    {scannedProduct.price_kg && (
                      <button
                        onClick={() => handleAddScannedProductToCart('kg')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Add as KG
                      </button>
                    )}
                    {scannedProduct.price_ons && (
                      <button
                        onClick={() => handleAddScannedProductToCart('ons')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Add as Ons
                      </button>
                    )}
                    {scannedProduct.price_liter && (
                      <button
                        onClick={() => handleAddScannedProductToCart('liter')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Add as Liter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
