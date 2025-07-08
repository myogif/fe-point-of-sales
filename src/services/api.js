import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
