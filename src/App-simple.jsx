import React, { useState } from 'react';

// Simple navigation component without router
const SimpleNavigation = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customers', label: 'Customers' },
    { id: 'products', label: 'Products' },
    { id: 'invoices', label: 'Invoices' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BillMaster</span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Simple page components
const Dashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">Welcome to your billing management system</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
        <p className="text-2xl font-bold text-gray-900">0</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
        <p className="text-2xl font-bold text-gray-900">0</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
        <p className="text-2xl font-bold text-gray-900">0</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
        <p className="text-2xl font-bold text-gray-900">$0.00</p>
      </div>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
      <div className="space-y-3">
        <p className="text-gray-600">Welcome to BillMaster! To get started:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Install the missing dependency: <code className="bg-gray-100 px-2 py-1 rounded">npm install react-router-dom</code></li>
          <li>Add some customers in the Customers section</li>
          <li>Create products in the Products section</li>
          <li>Generate invoices for your customers</li>
        </ol>
      </div>
    </div>
  </div>
);

const Customers = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-600">Manage your customer database</p>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Customer management will be available after installing react-router-dom.</p>
      <p className="text-sm text-gray-500 mt-2">Run: <code className="bg-gray-100 px-2 py-1 rounded">npm install react-router-dom</code></p>
    </div>
  </div>
);

const Products = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      <p className="mt-1 text-sm text-gray-600">Manage your product catalog</p>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Product management will be available after installing react-router-dom.</p>
      <p className="text-sm text-gray-500 mt-2">Run: <code className="bg-gray-100 px-2 py-1 rounded">npm install react-router-dom</code></p>
    </div>
  </div>
);

const Invoices = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
      <p className="mt-1 text-sm text-gray-600">Manage your billing invoices</p>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Invoice management will be available after installing react-router-dom.</p>
      <p className="text-sm text-gray-500 mt-2">Run: <code className="bg-gray-100 px-2 py-1 rounded">npm install react-router-dom</code></p>
    </div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'invoices':
        return <Invoices />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
