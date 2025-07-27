// API service for billing application
const API_BASE_URL = 'http://localhost:8080/api';

// Generic API request function with improved error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    mode: 'cors', // Enable CORS
    credentials: 'same-origin',
    ...options,
  };

  try {
    console.log(`Making API request to: ${url}`, config);
    const response = await fetch(url, config);
    
    console.log(`Response status: ${response.status}`);
    
    // Handle different response types
    if (response.status === 204) {
      // No content response (successful delete)
      return null;
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } else {
      // Non-JSON response
      return await response.text();
    }
  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please ensure the backend is running on http://localhost:8080');
    }
    
    throw error;
  }
};

// Customer API
export const customerAPI = {
  getAll: () => apiRequest('/customers'),
  getById: (id) => apiRequest(`/customers/${id}`),
  create: (customer) => {
    console.log('Creating customer:', customer);
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },
  update: (id, customer) => {
    console.log('Updating customer:', id, customer);
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  },
  delete: (id) => {
    console.log('Deleting customer:', id);
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Product API
export const productAPI = {
  getAll: () => apiRequest('/products'),
  search: (query) => apiRequest(`/products?search=${encodeURIComponent(query)}`),
  getById: (id) => apiRequest(`/products/${id}`),
  create: (product) => {
    console.log('Creating product:', product);
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  update: (id, product) => {
    console.log('Updating product:', id, product);
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  delete: (id) => {
    console.log('Deleting product:', id);
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice API
export const invoiceAPI = {
  getAll: () => apiRequest('/invoices'),
  getByCustomer: (customerId) => apiRequest(`/invoices?customerId=${customerId}`),
  getByStatus: (status) => apiRequest(`/invoices?status=${status}`),
  getById: (id) => apiRequest(`/invoices/${id}`),
  create: (invoice) => {
    console.log('Creating invoice:', invoice);
    return apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },
  update: (id, invoice) => {
    console.log('Updating invoice:', id, invoice);
    return apiRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  },
  delete: (id) => {
    console.log('Deleting invoice:', id);
    return apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Test API connection
export const testConnection = async () => {
  try {
    await apiRequest('/customers');
    return { success: true, message: 'Backend connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  customerAPI,
  productAPI,
  invoiceAPI,
  testConnection,
};
