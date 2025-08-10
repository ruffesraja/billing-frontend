// Dynamic base URL based on environment
const getApiBaseUrl = () => {
  // In production (served from Spring Boot), use relative URLs
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In development, use full URL to Spring Boot
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

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

// Product API (simplified - only name management)
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

// Owner API - Enhanced business configuration
export const ownerAPI = {
  getAll: () => apiRequest('/owners'),
  getActive: () => apiRequest('/owners/active'),
  getById: (id) => apiRequest(`/owners/${id}`),
  create: (owner) => {
    console.log('Creating owner:', owner);
    return apiRequest('/owners', {
      method: 'POST',
      body: JSON.stringify(owner),
    });
  },
  update: (id, owner) => {
    console.log('Updating owner:', id, owner);
    return apiRequest(`/owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(owner),
    });
  },
  delete: (id) => {
    console.log('Deleting owner:', id);
    return apiRequest(`/owners/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice API (enhanced for new comprehensive structure)
export const invoiceAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add status filter
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    // Add date filters
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    
    // Add predefined date filter
    if (filters.dateFilter) {
      params.append('dateFilter', filters.dateFilter);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/invoices?${queryString}` : '/invoices';
    
    return apiRequest(endpoint);
  },
  
  getByStatus: (status) => apiRequest(`/invoices?status=${status}`),
  
  getByDateRange: (startDate, endDate, status = null) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    if (status) {
      params.append('status', status);
    }
    
    return apiRequest(`/invoices?${params.toString()}`);
  },
  
  getByDateFilter: (dateFilter, status = null) => {
    const params = new URLSearchParams();
    params.append('dateFilter', dateFilter);
    
    if (status) {
      params.append('status', status);
    }
    
    return apiRequest(`/invoices?${params.toString()}`);
  },
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
  downloadPdf: (id) => {
    // For PDF download, we need to handle binary response
    return fetch(`${API_BASE_URL}/invoices/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    });
  },
  searchByCustomer: (customerName) => apiRequest(`/invoices/search?customer=${encodeURIComponent(customerName)}`),
  getByCustomerEmail: (email) => apiRequest(`/invoices/customer/${encodeURIComponent(email)}`),
};

// Test API connection
export const testConnection = async () => {
  try {
    await apiRequest('/products');
    return { success: true, message: 'Backend connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  productAPI,
  ownerAPI,
  invoiceAPI,
  testConnection,
};
