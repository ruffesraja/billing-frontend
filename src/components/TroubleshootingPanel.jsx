import React, { useState } from 'react';
import { testConnection } from '../services/api';
import Button from './ui/Button';

const TroubleshootingPanel = () => {
  const [tests, setTests] = useState({
    connection: null,
    cors: null,
    endpoints: null,
  });
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const newTests = { ...tests };

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const connectionResult = await testConnection();
      newTests.connection = connectionResult;

      // Test 2: CORS check
      console.log('Testing CORS...');
      try {
        const response = await fetch('/api/customers', {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type',
          },
        });
        newTests.cors = {
          success: response.ok,
          message: response.ok ? 'CORS is properly configured' : 'CORS configuration issue',
        };
      } catch (error) {
        newTests.cors = {
          success: false,
          message: `CORS test failed: ${error.message}`,
        };
      }

      // Test 3: Individual endpoints
      console.log('Testing individual endpoints...');
      const endpointTests = [];
      
      const endpoints = [
        { name: 'Customers', url: '/customers' },
        { name: 'Products', url: '/products' },
        { name: 'Invoices', url: '/invoices' },
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`/api${endpoint.url}`);
          endpointTests.push({
            name: endpoint.name,
            success: response.ok,
            status: response.status,
            message: response.ok ? 'OK' : `HTTP ${response.status}`,
          });
        } catch (error) {
          endpointTests.push({
            name: endpoint.name,
            success: false,
            status: 'ERROR',
            message: error.message,
          });
        }
      }

      newTests.endpoints = {
        success: endpointTests.every(test => test.success),
        tests: endpointTests,
      };

    } catch (error) {
      console.error('Diagnostics error:', error);
    }

    setTests(newTests);
    setTesting(false);
  };

  const getStatusIcon = (success) => {
    if (success === null) return '⏳';
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success) => {
    if (success === null) return 'text-gray-500';
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">System Diagnostics</h3>
        <Button onClick={runDiagnostics} loading={testing} size="sm">
          {testing ? 'Running Tests...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Connection Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(tests.connection?.success)}</span>
            <div>
              <p className="font-medium text-gray-900">Backend Connection</p>
              <p className="text-sm text-gray-600">Testing connection to backend API</p>
            </div>
          </div>
          <div className={`text-sm ${getStatusColor(tests.connection?.success)}`}>
            {tests.connection?.message || 'Not tested'}
          </div>
        </div>

        {/* CORS Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(tests.cors?.success)}</span>
            <div>
              <p className="font-medium text-gray-900">CORS Configuration</p>
              <p className="text-sm text-gray-600">Cross-Origin Resource Sharing</p>
            </div>
          </div>
          <div className={`text-sm ${getStatusColor(tests.cors?.success)}`}>
            {tests.cors?.message || 'Not tested'}
          </div>
        </div>

        {/* Endpoints Test */}
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getStatusIcon(tests.endpoints?.success)}</span>
              <div>
                <p className="font-medium text-gray-900">API Endpoints</p>
                <p className="text-sm text-gray-600">Individual endpoint availability</p>
              </div>
            </div>
          </div>
          
          {tests.endpoints?.tests && (
            <div className="mt-3 space-y-2">
              {tests.endpoints.tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <span>{getStatusIcon(test.success)}</span>
                    <span>{test.name}</span>
                  </span>
                  <span className={getStatusColor(test.success)}>
                    {test.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure the Spring Boot backend is running on port 8080</li>
          <li>• Check that CORS is configured to allow requests from this origin</li>
          <li>• Verify that all API endpoints are properly mapped</li>
          <li>• Check browser console for detailed error messages</li>
          <li>• Ensure database is connected and accessible</li>
        </ul>
      </div>

      {/* System Information */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Frontend URL: {window.location.origin}</p>
          <p>Backend URL: Dynamic (based on environment)</p>
          <p>User Agent: {navigator.userAgent.split(' ')[0]}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingPanel;
