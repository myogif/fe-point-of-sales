import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Upload, Image as ImageIcon, Link, ToggleLeft, ToggleRight } from 'lucide-react';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';
import BarcodeScanner from './BarcodeScanner';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

const AddProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    barcode: '',
    description: '',
    unit_type: 'pcs',
    price_kg: '',
    price_ons: '',
    price_pcs: '',
    price_liter: '',
    stock: '',
    image_url: '',
    is_online: false
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imageInputMode, setImageInputMode] = useState('url'); // 'upload' or 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');

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
            description: product.description || '',
            unit_type: product.unit_type || 'pcs',
            price_kg: product.price_kg || '',
            price_ons: product.price_ons || '',
            price_pcs: product.price_pcs || '',
            price_liter: product.price_liter || '',
            stock: product.stock || '',
            image_url: product.image_url || '',
            is_online: product.is_online !== undefined ? product.is_online : false
          });
          
          setImagePreview(product.image_url || '');
          setInitialLoading(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product data');
          navigateBackToProducts();
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

  // URL validation function
  const isValidImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      // Check if URL ends with common image extensions
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i;
      return imageExtensions.test(url) || url.includes('imgur.com') || url.includes('cloudinary.com') || url.includes('amazonaws.com');
    } catch {
      return false;
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    
    if (url && isValidImageUrl(url)) {
      setFormData(prev => ({ ...prev, image_url: url }));
      setImagePreview(url);
    } else if (!url) {
      setFormData(prev => ({ ...prev, image_url: '' }));
      setImagePreview('');
    }
  };

  // Handle image URL validation on blur
  const handleImageUrlBlur = () => {
    if (imageUrlInput && !isValidImageUrl(imageUrlInput)) {
      toast.error('Please enter a valid image URL (jpg, png, gif, etc.)');
    }
  };

  // Navigate back to products with preserved state
  const navigateBackToProducts = () => {
    const state = location.state;
    if (state && state.returnPage) {
      // Build URL with query parameters to preserve the state
      const params = new URLSearchParams();
      if (state.returnPage > 1) params.set('page', state.returnPage);
      if (state.returnCategory && state.returnCategory !== 'all') params.set('category', state.returnCategory);
      if (state.returnSearch) params.set('search', state.returnSearch);
      
      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
      navigate(url);
    } else {
      navigate('/products');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      
      // Mobile PWA Debug Info
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone ||
                    document.referrer.includes('android-app://');
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log('📱 Mobile PWA Debug Info:', {
        isPWA,
        isMobile,
        isIOS,
        isAndroid,
        userAgent: navigator.userAgent,
        serviceWorkerController: !!navigator.serviceWorker?.controller,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        networkStatus: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : 'not available',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      });
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Mobile-optimized compression
      const options = {
        maxSizeMB: isMobile ? 0.5 : 1, // Smaller size for mobile
        maxWidthOrHeight: isMobile ? 600 : 800, // Lower resolution for mobile
        useWebWorker: !isMobile, // Disable web worker on mobile for better compatibility
        initialQuality: isMobile ? 0.6 : 0.8, // Lower quality for mobile
        alwaysKeepResolution: false,
        fileType: 'image/jpeg' // Force JPEG for better mobile compatibility
      };
      
      console.log('📦 Compressing image with mobile optimization...');
      const compressedFile = await imageCompression(file, options);
      console.log('✅ Image compressed:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        reduction: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%',
        isMobile,
        finalType: compressedFile.type
      });
      
      // Upload to backend with mobile-optimized retry logic
      const formDataUpload = new FormData();
      formDataUpload.append('image', compressedFile);
      
      let response;
      let retryCount = 0;
      const maxRetries = isMobile ? 5 : 3; // More retries for mobile
      
      // Network connectivity test
      const testNetworkConnectivity = async () => {
        const token = localStorage.getItem('auth_token');
        const hostname = window.location.hostname;
        const testUrl = hostname !== 'localhost' && hostname !== '127.0.0.1'
          ? `http://${hostname}:3001/api/auth/verify`
          : 'http://localhost:3001/api/auth/verify';
        
        try {
          console.log('🌐 Testing network connectivity to:', testUrl);
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            timeout: 5000,
            cache: 'no-cache',
            mode: 'cors'
          });
          
          console.log('🌐 Network test result:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          });
          
          return response.ok;
        } catch (error) {
          console.error('🌐 Network connectivity test failed:', error);
          return false;
        }
      };

      // Complete service worker bypass for mobile
      const bypassServiceWorker = async () => {
        if ('serviceWorker' in navigator && isMobile) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.active) {
              console.log('📱 Sending bypass message to service worker');
              
              // Send multiple bypass messages for better coverage
              const messages = [
                { type: 'BYPASS_NEXT_REQUEST', url: '/api/upload/image' },
                { type: 'BYPASS_ALL_UPLOADS' }
              ];
              
              for (const message of messages) {
                if (registration.active.postMessage) {
                  registration.active.postMessage(message);
                  console.log('📱 Sent SW message:', message);
                }
              }
              
              // Wait for the messages to be processed
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.warn('📱 Could not communicate with service worker:', error);
          }
        }
      };

      // Mobile-specific upload strategy with enhanced network handling
      const uploadStrategies = isMobile ? [
        // Strategy 1: Complete service worker bypass with network test
        async () => {
          console.log('📱 Strategy 1: Network test + SW bypass + Direct fetch');
          
          // Test network connectivity first
          const networkOk = await testNetworkConnectivity();
          if (!networkOk) {
            throw new Error('Network connectivity test failed - server may be unreachable');
          }
          
          // Bypass service worker
          await bypassServiceWorker();
          
          const token = localStorage.getItem('auth_token');
          const hostname = window.location.hostname;
          const apiUrl = hostname !== 'localhost' && hostname !== '127.0.0.1'
            ? `http://${hostname}:3001/api/upload/image`
            : 'http://localhost:3001/api/upload/image';
          
          console.log('📱 Using direct API URL:', apiUrl);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              body: formDataUpload,
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              cache: 'no-cache',
              mode: 'cors',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('📱 Direct fetch response:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
              headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            return { data };
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              throw new Error('Upload timeout - request took too long');
            }
            throw error;
          }
        },
        // Strategy 2: Standard API with service worker bypass
        async () => {
          console.log('📱 Strategy 2: SW bypass + Standard API');
          await bypassServiceWorker();
          return uploadAPI.uploadImage(formDataUpload);
        },
        // Strategy 3: Standard upload without modifications
        async () => {
          console.log('📱 Strategy 3: Standard upload');
          return uploadAPI.uploadImage(formDataUpload);
        },
        // Strategy 4: XMLHttpRequest fallback
        async () => {
          console.log('📱 Strategy 4: XMLHttpRequest fallback');
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const token = localStorage.getItem('auth_token');
            const hostname = window.location.hostname;
            const apiUrl = hostname !== 'localhost' && hostname !== '127.0.0.1'
              ? `http://${hostname}:3001/api/upload/image`
              : 'http://localhost:3001/api/upload/image';
            
            xhr.open('POST', apiUrl, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.timeout = 30000; // 30 second timeout
            
            xhr.onload = function() {
              console.log('📱 XMLHttpRequest response:', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText.substring(0, 200)
              });
              
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  resolve({ data });
                } catch (parseError) {
                  reject(new Error('Failed to parse response JSON'));
                }
              } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
              }
            };
            
            xhr.onerror = function() {
              reject(new Error('XMLHttpRequest network error'));
            };
            
            xhr.ontimeout = function() {
              reject(new Error('XMLHttpRequest timeout'));
            };
            
            xhr.send(formDataUpload);
          });
        }
      ] : [
        // Desktop strategy
        async () => uploadAPI.uploadImage(formDataUpload)
      ];
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🚀 Upload attempt ${retryCount + 1}/${maxRetries}...`);
          const startTime = Date.now();
          
          // Use different strategies for mobile
          const strategyIndex = isMobile ? Math.min(retryCount, uploadStrategies.length - 1) : 0;
          response = await uploadStrategies[strategyIndex]();
          
          const uploadTime = Date.now() - startTime;
          console.log('✅ Upload successful:', {
            attempt: retryCount + 1,
            strategy: strategyIndex + 1,
            uploadTime: uploadTime + 'ms',
            responseStatus: response.status,
            imageUrl: response.data.imageUrl,
            isMobile
          });
          
          break; // Success, exit retry loop
        } catch (uploadError) {
          retryCount++;
          console.error(`❌ Upload attempt ${retryCount} failed:`, {
            error: uploadError.message,
            status: uploadError.response?.status,
            statusText: uploadError.response?.statusText,
            data: uploadError.response?.data,
            code: uploadError.code,
            isPWA,
            isMobile,
            serviceWorkerActive: !!navigator.serviceWorker?.controller,
            networkStatus: navigator.onLine
          });
          
          if (retryCount >= maxRetries) {
            throw uploadError; // Re-throw after max retries
          }
          
          // Mobile-optimized wait time
          const waitTime = isMobile ? 2000 * retryCount : 1000 * retryCount;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      const imageUrl = response.data.imageUrl;
      
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('💥 Final upload error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        stack: error.stack,
        isPWA: window.matchMedia('(display-mode: standalone)').matches,
        serviceWorkerController: !!navigator.serviceWorker?.controller,
        networkStatus: navigator.onLine,
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : 'not available'
      });
      
      // Get detailed error information from backend
      const errorData = error.response?.data;
      const errorDetails = errorData?.details || error.message;
      const errorCode = errorData?.code || error.code;
      const errorName = errorData?.errorName || error.name;
      
      // Enhanced debugging for "Failed to fetch" errors
      let debugInfo = '';
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        debugInfo = `
Network Debug Info:
- Online Status: ${navigator.onLine}
- Service Worker: ${!!navigator.serviceWorker?.controller}
- PWA Mode: ${window.matchMedia('(display-mode: standalone)').matches}
- User Agent: ${navigator.userAgent.substring(0, 100)}
- Connection: ${navigator.connection ? navigator.connection.effectiveType : 'unknown'}
- Current URL: ${window.location.href}
- API Base: ${window.location.hostname !== 'localhost' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001'}

Troubleshooting Steps:
1. Check if backend server is running on port 3001
2. Verify mobile device can access the server IP
3. Check firewall/network settings
4. Try refreshing the PWA
5. Clear browser cache and service worker`;
      }
      
      // Show detailed error in alert for debugging (as requested)
      alert(`Upload Error Details:
Error: ${errorDetails}
Code: ${errorCode}
Name: ${errorName}
Status: ${error.response?.status || 'No response'}
${debugInfo}
Debug Info: ${JSON.stringify(errorData?.debug || {}, null, 2)}`);
      
      // Enhanced error messages for different scenarios
      if (error.message === 'Failed to fetch') {
        toast.error('Network connection failed. Please check if the server is accessible and try again.');
      } else if (error.message.includes('timeout') || error.message.includes('abort')) {
        toast.error('Upload timeout. Please check your connection and try again.');
      } else if (error.response?.status === 413) {
        toast.error('Image file is too large. Please choose a smaller image.');
      } else if (error.response?.status === 400) {
        toast.error(`Invalid request: ${errorDetails}`);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 405) {
        toast.error('Method not allowed. Server configuration issue.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorDetails.includes('R2')) {
        toast.error(`Storage error: ${errorDetails}`);
      } else if (errorDetails.includes('environment variable')) {
        toast.error('Server configuration error. Please contact support.');
      } else {
        toast.error(`Upload failed: ${errorDetails}`);
      }
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

    // Validate that at least one price is provided based on unit type
    const currentPrice = formData[`price_${formData.unit_type}`];
    if (!currentPrice || parseFloat(currentPrice) <= 0) {
      toast.error(`Price for ${formData.unit_type} must be greater than 0`);
      return;
    }

    // Validate price limits (max 99,999,999.99 due to database precision)
    const maxPrice = 99999999.99;
    if (parseFloat(currentPrice) > maxPrice) {
      toast.error(`Price cannot exceed ${maxPrice.toLocaleString()}`);
      return;
    }

    // Validate other price fields if they have values
    const priceFields = ['price_kg', 'price_ons', 'price_pcs', 'price_liter'];
    for (const field of priceFields) {
      if (formData[field] && parseFloat(formData[field]) > maxPrice) {
        toast.error(`${field.replace('price_', '').toUpperCase()} price cannot exceed ${maxPrice.toLocaleString()}`);
        return;
      }
    }

    if (formData.stock && parseFloat(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    // Validate stock limit
    const maxStock = 99999999.99;
    if (formData.stock && parseFloat(formData.stock) > maxStock) {
      toast.error(`Stock cannot exceed ${maxStock.toLocaleString()}`);
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
        name: formData.name.trim(),
        barcode: formData.barcode.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        unit_type: formData.unit_type,
        price_kg: parseFloat(formData.price_kg) || null,
        price_ons: parseFloat(formData.price_ons) || null,
        price_pcs: parseFloat(formData.price_pcs) || null,
        price_liter: parseFloat(formData.price_liter) || null,
        stock: parseFloat(formData.stock) || 0,
        image_url: formData.image_url,
        is_online: formData.is_online
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
      
      navigateBackToProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        if (error.response?.data?.code === 'DUPLICATE_BARCODE') {
          toast.error(`Product with barcode "${formData.barcode}" already exists. Please use a different barcode.`);
        } else {
          toast.error(error.response?.data?.error || 'Conflict error occurred');
        }
      } else if (error.response?.status === 400) {
        if (error.response?.data?.code === 'INVALID_CATEGORY') {
          toast.error('Invalid category selected. Please choose a valid category.');
        } else if (error.response?.data?.code === 'NUMERIC_OVERFLOW') {
          toast.error('One or more values exceed the maximum limit (99,999,999.99)');
        } else {
          const message = error.response?.data?.error || 'Invalid product data';
          toast.error(message);
        }
      } else if (error.response?.status === 404 && isEditMode) {
        toast.error('Product not found. It may have been deleted.');
        navigateBackToProducts();
      } else {
        const message = error.response?.data?.error || error.message || 'Failed to save product';
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
          onClick={navigateBackToProducts}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Pilih kategori</option>
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
              Nama Produk *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan deskripsi produk"
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
                  placeholder="Otomatis dibuat jika kosong"
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
                Buat
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan untuk dibuat otomatis saat menyimpan
            </p>
          </div>

          {/* Unit Type */}
          <div>
            <label htmlFor="unit_type" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Satuan *
            </label>
            <select
              id="unit_type"
              name="unit_type"
              value={formData.unit_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            >
              <option value="pcs">Buah (pcs)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="ons">Ons</option>
              <option value="liter">Liter</option>
            </select>
          </div>

          {/* Dynamic Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price PCS */}
            <div>
              <label htmlFor="price_pcs" className="block text-sm font-medium text-gray-700 mb-1">
                Harga per Buah {formData.unit_type === 'pcs' ? '*' : ''}
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
                  max="99999999.99"
                  step="100"
                  required={formData.unit_type === 'pcs'}
                />
              </div>
            </div>

            {/* Price KG */}
            <div>
              <label htmlFor="price_kg" className="block text-sm font-medium text-gray-700 mb-1">
                Harga per KG {formData.unit_type === 'kg' ? '*' : ''}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="price_kg"
                  name="price_kg"
                  value={formData.price_kg}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="99999999.99"
                  step="100"
                  required={formData.unit_type === 'kg'}
                />
              </div>
            </div>

            {/* Price ONS */}
            <div>
              <label htmlFor="price_ons" className="block text-sm font-medium text-gray-700 mb-1">
                Harga per Ons {formData.unit_type === 'ons' ? '*' : ''}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="price_ons"
                  name="price_ons"
                  value={formData.price_ons}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="99999999.99"
                  step="100"
                  required={formData.unit_type === 'ons'}
                />
              </div>
            </div>

            {/* Price LITER */}
            <div>
              <label htmlFor="price_liter" className="block text-sm font-medium text-gray-700 mb-1">
                Harga per Liter {formData.unit_type === 'liter' ? '*' : ''}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  id="price_liter"
                  name="price_liter"
                  value={formData.price_liter}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="99999999.99"
                  step="100"
                  required={formData.unit_type === 'liter'}
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stok
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
              max="99999999.99"
              step="1"
            />
          </div>

          {/* Online Status */}
          <div>
            <label htmlFor="is_online" className="block text-sm font-medium text-gray-700 mb-1">
              Status Online
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="is_online"
                  value="true"
                  checked={formData.is_online === true}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_online: true }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ya (Tersedia Online)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="is_online"
                  value="false"
                  checked={formData.is_online === false}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_online: false }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Tidak (Hanya Toko)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pilih apakah produk ini tersedia untuk penjualan online
            </p>
          </div>

          {/* Image Upload/URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Gambar Produk
              </label>
              
              {/* Toggle between Upload and URL */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${imageInputMode === 'upload' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  Unggah
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setImageInputMode(imageInputMode === 'upload' ? 'url' : 'upload');
                    // Clear current image when switching modes
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image_url: '' }));
                    setImageUrlInput('');
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {imageInputMode === 'upload' ? (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  )}
                </button>
                <span className={`text-sm ${imageInputMode === 'url' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  URL
                </span>
              </div>
            </div>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-300"
                  onError={() => {
                    toast.error('Failed to load image. Please check the URL or try a different image.');
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image_url: '' }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image_url: '' }));
                    setImageUrlInput('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {imageInputMode === 'upload' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Unggah gambar produk</p>
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
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Pilih</span>
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
                        <span>Kamera</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Atau beralih ke mode URL untuk memasukkan tautan gambar
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Link className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={handleImageUrlChange}
                        onBlur={handleImageUrlBlur}
                        placeholder="Masukkan URL gambar (contoh: https://contoh.com/gambar.jpg)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Masukkan tautan langsung ke gambar (jpg, png, gif, dll.)
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        Atau beralih ke mode Unggah untuk memilih file dari perangkat Anda
                      </p>
                    </div>
                  </div>
                )}
              </>
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
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-auto p-4 relative">
            <h3 className="text-lg font-semibold mb-4">Pindai Barcode</h3>
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