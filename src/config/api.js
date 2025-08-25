// API Configuration
const API_CONFIG = {
  // Base URL configuration - Production-first approach
  getBaseUrl: () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Debug logging for troubleshooting
    console.log('API Config Debug:', {
      hostname,
      port,
      NODE_ENV: process.env.NODE_ENV,
      location: window.location.href
    });
    
    // PRODUCTION: Always use relative URLs when not in development
    if (hostname !== 'localhost' || process.env.NODE_ENV === 'production') {
      console.log('Using production relative URL: /api');
      return '/api';
    }
    
    // DEVELOPMENT: Use specific ports for local development
    if (hostname === 'localhost') {
      // If running on port 8081 (Docker), use that
      if (port === '8081') {
        console.log('Using Docker development URL: http://localhost:8081/api');
        return 'http://localhost:8081/api';
      }
      // Vite dev server port (React development)
      if (port === '5173') {
        console.log('Using Vite development URL: http://localhost:8080/api');
        return 'http://localhost:8080/api';
      }
      // Create React App dev server port
      if (port === '3000') {
        console.log('Using CRA development URL: http://localhost:8080/api');
        return 'http://localhost:8080/api';
      }
      // No port specified (usually production or served from backend)
      if (port === '') {
        console.log('Using production relative URL (no port): /api');
        return '/api';
      }
    }
    
    // Fallback to relative URLs for production
    console.log('Using fallback relative URL: /api');
    return '/api';
  },
  
  // File upload endpoints - Always relative
  fileUpload: {
    signature: '/files/upload/signature'
  },
  
  // API endpoints - Always relative
  endpoints: {
    owners: '/owners',
    products: '/products',
    invoices: '/invoices',
    customers: '/customers'
  },
  
  // Utility method to test current configuration
  testConfiguration: () => {
    const baseUrl = API_CONFIG.getBaseUrl();
    console.log('🔧 Current API Configuration Test:');
    console.log('📍 Base URL:', baseUrl);
    console.log('🌐 Current Location:', window.location.href);
    console.log('🏠 Hostname:', window.location.hostname);
    console.log('🔌 Port:', window.location.port);
    console.log('⚙️ NODE_ENV:', process.env.NODE_ENV);
    console.log('📁 Signature Upload URL:', `${baseUrl}/files/upload/signature`);
    return baseUrl;
  }
};

export default API_CONFIG;
