// Utility functions for the billing application

// Format currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Format date for input fields
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date input formatting error:', error);
    return '';
  }
};

// Calculate tax amount
export const calculateTax = (amount, taxPercent) => {
  const numAmount = Number(amount) || 0;
  const numTaxPercent = Number(taxPercent) || 0;
  return (numAmount * numTaxPercent) / 100;
};

// Calculate total with tax
export const calculateTotalWithTax = (amount, taxPercent) => {
  const numAmount = Number(amount) || 0;
  const tax = calculateTax(numAmount, taxPercent);
  return numAmount + tax;
};

// Validate email - improved regex
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
};

// Validate phone number - more flexible validation
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  // Accept phone numbers with 10-15 digits
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

// Get status color
export const getStatusColor = (status) => {
  if (!status) return 'text-gray-600 bg-gray-100';
  
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'text-green-600 bg-green-100';
    case 'UNPAID':
      return 'text-yellow-600 bg-yellow-100';
    case 'OVERDUE':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate invoice number (fallback if backend doesn't provide)
export const generateInvoiceNumber = () => {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `INV-${timestamp}`;
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { subtotal: 0, totalTax: 0, total: 0 };
  }

  let subtotal = 0;
  let totalTax = 0;

  items.forEach(item => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const taxPercent = Number(item.taxPercent) || 0;
    
    const itemSubtotal = quantity * unitPrice;
    const itemTax = calculateTax(itemSubtotal, taxPercent);
    
    subtotal += itemSubtotal;
    totalTax += itemTax;
  });

  const total = subtotal + totalTax;

  return { 
    subtotal: Number(subtotal.toFixed(2)), 
    totalTax: Number(totalTax.toFixed(2)), 
    total: Number(total.toFixed(2)) 
  };
};

// Sort array by field
export const sortBy = (array, field, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle nested properties (e.g., 'customer.name')
    if (field.includes('.')) {
      const fields = field.split('.');
      aVal = fields.reduce((obj, key) => obj?.[key], a);
      bVal = fields.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? 1 : -1;
    if (bVal == null) return direction === 'asc' ? -1 : 1;
    
    // Convert to strings for comparison if needed
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, fields) => {
  if (!Array.isArray(array)) return [];
  if (!searchTerm || !searchTerm.trim()) return array;
  
  const term = searchTerm.toLowerCase().trim();
  
  return array.filter(item => {
    return fields.some(field => {
      let value = item[field];
      
      // Handle nested properties (e.g., 'customer.name')
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        value = fieldParts.reduce((obj, key) => obj?.[key], item);
      }
      
      // Convert to string and search
      const stringValue = String(value || '').toLowerCase();
      return stringValue.includes(term);
    });
  });
};

// Validate required fields
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

// Validate number
export const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (min !== null && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== null && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone; // Return original if not standard format
};
