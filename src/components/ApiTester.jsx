import React, { useState } from 'react';
import { productAPI, invoiceAPI } from '../services/api';
import Button from './ui/Button';

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testApi = async (apiName, operation, ...args) => {
    const key = `${apiName}_${operation}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      let result;
      switch (apiName) {
        case 'product':
          result = await productAPI[operation](...args);
          break;
        case 'invoice':
          result = await invoiceAPI[operation](...args);
          break;
        default:
          throw new Error(`Unknown API: ${apiName}`);
      }
      
      setResults(prev => ({ 
        ...prev, 
        [key]: { success: true, data: result } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [key]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderResult = (key) => {
    const result = results[key];
    if (!result) return null;
    
    return (
      <div className={`mt-2 p-2 rounded text-sm ${
        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {result.success ? (
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        ) : (
          <span>Error: {result.error}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">API Tester</h2>
      
      {/* Product API Tests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Product API</h3>
        <div className="space-y-2">
          <Button
            onClick={() => testApi('product', 'getAll')}
            loading={loading.product_getAll}
            variant="secondary"
          >
            Get All Products
          </Button>
          {renderResult('product_getAll')}
          
          <Button
            onClick={() => testApi('product', 'create', { name: 'Test Product' })}
            loading={loading.product_create}
            variant="secondary"
          >
            Create Test Product
          </Button>
          {renderResult('product_create')}
        </div>
      </div>

      {/* Invoice API Tests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Invoice API</h3>
        <div className="space-y-2">
          <Button
            onClick={() => testApi('invoice', 'getAll')}
            loading={loading.invoice_getAll}
            variant="secondary"
          >
            Get All Invoices
          </Button>
          {renderResult('invoice_getAll')}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testApi = async (apiName, operation, ...args) => {
    const key = `${apiName}_${operation}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      let result;
      switch (apiName) {
        case 'customer':
          result = await customerAPI[operation](...args);
          break;
        case 'product':
          result = await productAPI[operation](...args);
          break;
        case 'invoice':
          result = await invoiceAPI[operation](...args);
          break;
        default:
          throw new Error('Unknown API');
      }
      
      setResults(prev => ({
        ...prev,
        [key]: { success: true, data: result, timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      console.error(`${apiName} ${operation} error:`, error);
      setResults(prev => ({
        ...prev,
        [key]: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const testCustomerCreate = () => {
    const testCustomer = {
      name: 'Test Customer ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      address: '123 Test Street, Test City, TC 12345'
    };
    testApi('customer', 'create', testCustomer);
  };

  const testProductCreate = () => {
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product created at ' + new Date().toLocaleString(),
      unitPrice: 99.99,
      taxPercent: 8.25
    };
    testApi('product', 'create', testProduct);
  };

  const renderResult = (key) => {
    const result = results[key];
    if (!result) return null;

    return (
      <div className={`mt-2 p-3 rounded-md text-sm ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex justify-between items-start">
          <span className={result.success ? 'text-green-800' : 'text-red-800'}>
            {result.success ? '✅ Success' : '❌ Error'}
          </span>
          <span className="text-xs text-gray-500">{result.timestamp}</span>
        </div>
        {result.success ? (
          <pre className="mt-2 text-xs overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        ) : (
          <p className="mt-2 text-red-700">{result.error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">API Testing Panel</h3>
      
      <div className="space-y-6">
        {/* Customer Tests */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Customer API Tests</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Button
                onClick={() => testApi('customer', 'getAll')}
                loading={loading.customer_getAll}
                size="sm"
                className="w-full"
              >
                Get All Customers
              </Button>
              {renderResult('customer_getAll')}
            </div>
            
            <div>
              <Button
                onClick={testCustomerCreate}
                loading={loading.customer_create}
                size="sm"
                className="w-full"
              >
                Create Test Customer
              </Button>
              {renderResult('customer_create')}
            </div>
            
            <div>
              <Button
                onClick={() => {
                  const id = prompt('Enter customer ID to delete:');
                  if (id) testApi('customer', 'delete', parseInt(id));
                }}
                loading={loading.customer_delete}
                size="sm"
                variant="danger"
                className="w-full"
              >
                Delete Customer
              </Button>
              {renderResult('customer_delete')}
            </div>
          </div>
        </div>

        {/* Product Tests */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Product API Tests</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Button
                onClick={() => testApi('product', 'getAll')}
                loading={loading.product_getAll}
                size="sm"
                className="w-full"
              >
                Get All Products
              </Button>
              {renderResult('product_getAll')}
            </div>
            
            <div>
              <Button
                onClick={testProductCreate}
                loading={loading.product_create}
                size="sm"
                className="w-full"
              >
                Create Test Product
              </Button>
              {renderResult('product_create')}
            </div>
            
            <div>
              <Button
                onClick={() => {
                  const id = prompt('Enter product ID to delete:');
                  if (id) testApi('product', 'delete', parseInt(id));
                }}
                loading={loading.product_delete}
                size="sm"
                variant="danger"
                className="w-full"
              >
                Delete Product
              </Button>
              {renderResult('product_delete')}
            </div>
          </div>
        </div>

        {/* Invoice Tests */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Invoice API Tests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Button
                onClick={() => testApi('invoice', 'getAll')}
                loading={loading.invoice_getAll}
                size="sm"
                className="w-full"
              >
                Get All Invoices
              </Button>
              {renderResult('invoice_getAll')}
            </div>
            
            <div>
              <Button
                onClick={() => {
                  const id = prompt('Enter invoice ID to delete:');
                  if (id) testApi('invoice', 'delete', parseInt(id));
                }}
                loading={loading.invoice_delete}
                size="sm"
                variant="danger"
                className="w-full"
              >
                Delete Invoice
              </Button>
              {renderResult('invoice_delete')}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use this panel to test individual API operations</li>
          <li>• Check the browser console (F12) for detailed error logs</li>
          <li>• Ensure your backend is running on http://localhost:8080</li>
          <li>• Green results indicate success, red results indicate errors</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTester;
