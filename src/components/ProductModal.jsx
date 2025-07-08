import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';
import { formatPrice } from '../utils/priceFormatter';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    description: '',
    unit_type: 'pcs',
    price: '',
    stock: '',
    category_id: '',
    image_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      const unit = product.unit_type || 'pcs';
      const price = product[`price_${unit}`] || '';
      setFormData({
        name: product.name || '',
        barcode: product.barcode || '',
        description: product.description || '',
        unit_type: unit,
        price: price,
        stock: product.stock || '',
        category_id: product.category_id || '',
        image_url: product.image_url || ''
      });
      setImagePreview(product.image_url || '');
    } else {
      setFormData({
        name: '',
        barcode: '',
        description: '',
        unit_type: 'pcs',
        price: '',
        stock: '',
        category_id: '',
        image_url: ''
      });
      setImagePreview('');
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ limit: 999 });
      if (response && response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Upload to backend
      const formDataUpload = new FormData();
      formDataUpload.append('image', compressedFile);
      
      const response = await uploadAPI.uploadImage(formDataUpload);
      const imageUrl = response.data.imageUrl;
      
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.barcode.trim()) {
      toast.error('Barcode is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.price) {
      toast.error('Please set a price');
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name,
        barcode: formData.barcode,
        description: formData.description,
        unit_type: formData.unit_type,
        stock: parseFloat(formData.stock) || 0,
        category_id: formData.category_id,
        image_url: formData.image_url,
        price_kg: null,
        price_ons: null,
        price_pcs: null,
        price_liter: null,
      };
      
      productData[`price_${formData.unit_type}`] = parseFloat(formData.price);
      
      if (product) {
        // Update existing product
        await productsAPI.update(product.id, productData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409 && error.response?.data?.code === 'DUPLICATE_BARCODE') {
        toast.error(`Product with barcode "${formData.barcode}" already exists. Please use a different barcode.`);
      } else {
        const message = error.response?.data?.error || 'Failed to save product';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScan = (scannedBarcode) => {
    setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
    setIsScannerOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter barcode"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-green-600"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Pricing and Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing & Image</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Type *
                  </label>
                  <select
                    name="unit_type"
                    value={formData.unit_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="pcs">Pcs</option>
                    <option value="kg">Kg</option>
                    <option value="ons">Ons</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per {formData.unit_type} *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="100"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Price Preview */}
              {formData.price && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price Preview:</h4>
                  <div className="text-sm space-y-1">
                    <div>{formatPrice(formData.price)}/{formData.unit_type}</div>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Product preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload product image</p>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-file"
                        disabled={imageUploading}
                      />
                      <label
                        htmlFor="image-upload-file"
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {imageUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Choose</span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-camera"
                        disabled={imageUploading}
                      />
                      <label
                        htmlFor="image-upload-camera"
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Camera</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{product ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>

    {isScannerOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg w-full max-w-md mx-auto p-4 relative">
          <h3 className="text-lg font-semibold mb-4">Scan Barcode</h3>
          <button
            onClick={() => setIsScannerOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
          <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
        </div>
      </div>
    )}
  </>
  );
};

export default ProductModal;
