import axios from 'axios';

// Get the current host for mobile compatibility
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // Check if we're on mobile by looking at the hostname
    const hostname = window.location.hostname;
    
    // If accessing via IP address (mobile), use the same IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001/api`;
    }
    
    // Default localhost for desktop development
    return 'http://localhost:3001/api';
  }
  
  // Production URL
  return 'https://be-point-of-sales.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with mobile-friendly configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Mobile-specific timeout and retry settings
  timeout: 30000, // 30 seconds
  // Add network debugging
  transformRequest: [function (data, headers) {
    console.log('📡 API Request:', {
      baseURL: API_BASE_URL,
      url: headers.url,
      method: headers.method,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      networkStatus: navigator.onLine
    });
    return data;
  }, ...axios.defaults.transformRequest]
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and other common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Products API
export const productsAPI = {
  getAll: (params) => {
    const { signal, ...restParams } = params || {};
    return api.get('/products', { params: restParams, signal });
  },
  getById: (id, signal) => api.get(`/products/${id}`, { signal }),
  getByBarcode: (barcode, signal) => api.get(`/products/barcode/${barcode}`, { signal }),
  create: (productData, signal) => api.post('/products', productData, { signal }),
  update: (id, productData, signal) => api.put(`/products/${id}`, productData, { signal }),
  delete: (id, signal) => api.delete(`/products/${id}`, { signal }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => {
    const { signal, ...restParams } = params || {};
    return api.get('/categories', { params: restParams, signal });
  },
  create: (categoryData, signal) => api.post('/categories', categoryData, { signal }),
  update: (id, categoryData, signal) => api.put(`/categories/${id}`, categoryData, { signal }),
  delete: (id, signal) => api.delete(`/categories/${id}`, { signal }),
};

// Sales API
export const salesAPI = {
  create: (saleData) => api.post('/sales', saleData),
  createCredit: (creditData) => api.post('/sales/credit', creditData),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
};

// Credits API
export const creditsAPI = {
  getAll: (params) => api.get('/credits', { params }),
  getTotalOutstanding: () => api.get('/credits/total-outstanding'),
  getByCustomer: (customerName, params) => api.get(`/credits/customer/${encodeURIComponent(customerName)}`, { params }),
  getById: (id) => api.get(`/credits/${id}`),
  createCredit: (creditData) => api.post('/credits', creditData),
  makePayment: (id, data) => api.post(`/credits/pay/${id}`, data)
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => {
    // Detect mobile environment
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Mobile-specific configuration
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: isMobile ? 60000 : 30000, // Longer timeout for mobile
      // Mobile-specific settings
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      // Ensure the request bypasses service worker cache
      cache: 'no-cache',
      // Mobile network optimization
      ...(isMobile && {
        adapter: 'http', // Force HTTP adapter on mobile
        validateStatus: (status) => status < 500, // Accept more status codes on mobile
      })
    };

    console.log('📱 Mobile upload config:', {
      isMobile,
      isIOS,
      isAndroid,
      timeout: uploadConfig.timeout,
      userAgent: navigator.userAgent
    });

    return api.post('/upload/image', formData, uploadConfig)
      .catch(error => {
        console.error('📱 Mobile upload error:', {
          isMobile,
          isIOS,
          isAndroid,
          error: error.message,
          code: error.code,
          status: error.response?.status,
          network: navigator.onLine
        });
        
        // Enhanced error handling for mobile PWA
        if (!error.response && !error.request) {
          // Network error
          error.code = 'NETWORK_ERROR';
          error.message = isMobile
            ? 'Mobile network error. Please check your connection and try again.'
            : 'Network connection failed. Please check your internet connection.';
        } else if (error.code === 'ECONNABORTED') {
          // Timeout error
          error.message = isMobile
            ? 'Mobile upload timeout. Please try with a smaller image or better connection.'
            : 'Upload timeout. Please try again with a smaller image.';
        } else if (!error.response) {
          // Request was made but no response received
          error.code = 'NETWORK_ERROR';
          error.message = isMobile
            ? 'No response from server. Please check your mobile connection.'
            : 'No response from server. Please check your connection.';
        } else if (isMobile && error.response?.status >= 500) {
          // Server error on mobile
          error.message = 'Server error on mobile. Please try again or contact support.';
        }
        
        throw error;
      });
  },
};

export default api;
