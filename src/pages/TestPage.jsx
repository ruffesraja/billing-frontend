import React, { useState } from 'react';
import { customerAPI, productAPI, invoiceAPI } from '../services/api';
import Button from '../components/ui/Button';
import ModalTest from '../components/ModalTest';

const TestPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModalTest, setShowModalTest] = useState(false);

  const addResult = (test, success, data, error = null) => {
    const result = {
      id: Date.now(),
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResults(prev => [result, ...prev]);
  };

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      addResult(testName, true, result);
      console.log(`✅ ${testName} passed:`, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
      console.error(`❌ ${testName} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test 1: Get all customers
    await runTest('Get All Customers', () => customerAPI.getAll());
    
    // Test 2: Create customer
    await runTest('Create Customer', () => 
      customerAPI.create({
        name: `Test Customer ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: '1234567890',
        address: '123 Test Street, Test City, TC 12345'
      })
    );
    
    // Test 3: Get all products
    await runTest('Get All Products', () => productAPI.getAll());
    
    // Test 4: Create product
    await runTest('Create Product', () => 
      productAPI.create({
        name: `Test Product ${Date.now()}`,
        description: 'This is a test product for debugging',
        unitPrice: 99.99,
        taxPercent: 8.25
      })
    );
    
    // Test 5: Get all invoices
    await runTest('Get All Invoices', () => invoiceAPI.getAll());
    
    console.log('All tests completed!');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API & Modal Test Page</h1>
        <p className="mt-1 text-sm text-gray-600">
          Test all CRUD operations and modal functionality
        </p>
      </div>

      {/* Modal Test Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Modal Functionality Test</h2>
          <Button 
            onClick={() => setShowModalTest(!showModalTest)}
            variant="outline"
          >
            {showModalTest ? 'Hide' : 'Show'} Modal Test
          </Button>
        </div>
        
        {showModalTest && (
          <div className="border-t pt-4">
            <ModalTest />
          </div>
        )}
      </div>

      {/* API Test Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Tests</h2>
        <div className="flex space-x-4">
          <Button 
            onClick={runAllTests} 
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Running Tests...' : 'Run All API Tests'}
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={loading}
          >
            Clear Results
          </Button>
        </div>
      </div>

      {/* Individual Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Customer Tests</h3>
          <div className="space-y-2">
            <Button
              onClick={() => runTest('Get Customers', () => customerAPI.getAll())}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Get All Customers
            </Button>
            <Button
              onClick={() => runTest('Create Customer', () => 
                customerAPI.create({
                  name: `Test Customer ${Date.now()}`,
                  email: `test${Date.now()}@example.com`,
                  phone: '1234567890',
                  address: '123 Test Street'
                })
              )}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Create Test Customer
            </Button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Product Tests</h3>
          <div className="space-y-2">
            <Button
              onClick={() => runTest('Get Products', () => productAPI.getAll())}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Get All Products
            </Button>
            <Button
              onClick={() => runTest('Create Product', () => 
                productAPI.create({
                  name: `Test Product ${Date.now()}`,
                  description: 'Test product description',
                  unitPrice: 99.99,
                  taxPercent: 8.25
                })
              )}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Create Test Product
            </Button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Invoice Tests</h3>
          <div className="space-y-2">
            <Button
              onClick={() => runTest('Get Invoices', () => invoiceAPI.getAll())}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Get All Invoices
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {results.map((result) => (
              <div key={result.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {result.success ? '✅' : '❌'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{result.test}</p>
                      <p className="text-sm text-gray-500">{result.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      result.success 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
                
                {result.error && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {result.error}
                    </p>
                  </div>
                )}
                
                {result.success && result.data && (
                  <div className="mt-3">
                    <details className="cursor-pointer">
                      <summary className="text-sm text-gray-600 hover:text-gray-900">
                        View Response Data
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to Use This Test Page</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. <strong>Test Modal:</strong> Click "Show Modal Test" to test modal functionality</li>
          <li>2. <strong>Run API Tests:</strong> Click "Run All API Tests" to test all operations</li>
          <li>3. <strong>Individual Tests:</strong> Use individual buttons to test specific operations</li>
          <li>4. <strong>Check Results:</strong> Green ✅ = Success, Red ❌ = Error</li>
          <li>5. <strong>Debug Errors:</strong> Click "View Response Data" to see detailed information</li>
          <li>6. <strong>Console Logs:</strong> Open F12 → Console for detailed debugging info</li>
        </ul>
      </div>

      {/* Backend Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="font-medium text-gray-900 mb-2">Backend Requirements</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Backend must be running on <code className="bg-gray-200 px-1 rounded">http://localhost:8080</code></li>
          <li>• CORS must be configured to allow requests from this origin</li>
          <li>• Database must be connected and accessible</li>
          <li>• API endpoints must be properly mapped</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
