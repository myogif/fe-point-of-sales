import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';
import BarcodeScanner from './BarcodeScanner';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

const AddProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    barcode: '',
    price_pcs: '',
    cost_price: '',
    stock: '',
    sku: '',
    unit: 'pcs',
    image_url: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll({ limit: 999 });
        if (response && response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (isEditMode) {
        try {
          const response = await productsAPI.getById(id);
          const product = response.data;
          
          setFormData({
            category_id: product.category_id || '',
            name: product.name || '',
            barcode: product.barcode || '',
            price_pcs: product.price_pcs || '',
            cost_price: product.cost_price || '',
            stock: product.stock || '',
            sku: product.sku || '',
            unit: product.unit || 'pcs',
            image_url: product.image_url || ''
          });
          
          setImagePreview(product.image_url || '');
          setInitialLoading(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product data');
          navigate('/products');
        }
      }
    };
    
    if (isEditMode) {
      fetchProductData();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const generateBarcode = () => {
    // Generate a random 13-digit barcode
    const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    setFormData(prev => ({ ...prev, barcode: randomBarcode.toString() }));
  };

  const handleScan = (scannedBarcode) => {
    setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
    setIsScannerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.price_pcs) {
      toast.error('Selling price is required');
      return;
    }

    // Auto-generate barcode if empty
    if (!formData.barcode.trim()) {
      const randomBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
      formData.barcode = randomBarcode.toString();
    }

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name,
        barcode: formData.barcode,
        category_id: formData.category_id,
        price_pcs: parseFloat(formData.price_pcs) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock: parseFloat(formData.stock) || 0,
        sku: formData.sku,
        unit: formData.unit,
        image_url: formData.image_url
      };
      
      if (isEditMode) {
        // Update existing product
        await productsAPI.update(id, productData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/products')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated if empty"
                  maxLength={13}
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={generateBarcode}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to auto-generate on save
            </p>
          </div>

          {/* Selling Price */}
          <div>
            <label htmlFor="price_pcs" className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                Rp
              </span>
              <input
                type="number"
                id="price_pcs"
                name="price_pcs"
                value={formData.price_pcs}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {/* Cost Price */}
          <div>
            <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                Rp
              </span>
              <input
                type="number"
                id="cost_price"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              SKU (Optional)
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter SKU"
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="ons">ons</option>
              <option value="liter">liter</option>
            </select>
          </div>

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
                  className="w-full h-48 object-cover rounded-xl border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image_url: '' }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
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
                    className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
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
                    className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-auto p-4 relative">
            <h3 className="text-lg font-semibold mb-4">Scan Barcode</h3>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;