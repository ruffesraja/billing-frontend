import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI, productAPI, invoiceAPI, testConnection } from '../services/api';
import { formatCurrency, getStatusColor } from '../utils/helpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import TroubleshootingPanel from '../components/TroubleshootingPanel';

// Simple icons
const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const PackageIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DollarSignIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const StatCard = ({ title, value, icon: Icon, color, link, loading = false }) => {
  const content = (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
              ) : (
                value
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block hover:scale-105 transition-transform duration-200">
      {content}
    </Link>
  ) : (
    content
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const testBackendConnection = async () => {
    console.log('Testing backend connection...');
    const result = await testConnection();
    setConnectionStatus(result);
    return result.success;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First test the connection
      const isConnected = await testBackendConnection();
      if (!isConnected) {
        setShowTroubleshooting(true);
        throw new Error('Unable to connect to backend server');
      }
      
      console.log('Fetching dashboard data...');
      
      // Fetch all data with individual error handling
      const results = await Promise.allSettled([
        customerAPI.getAll(),
        productAPI.getAll(),
        invoiceAPI.getAll(),
      ]);

      const [customersResult, productsResult, invoicesResult] = results;

      // Handle customers
      const customers = customersResult.status === 'fulfilled' ? customersResult.value : [];
      if (customersResult.status === 'rejected') {
        console.error('Failed to fetch customers:', customersResult.reason);
      }

      // Handle products
      const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
      if (productsResult.status === 'rejected') {
        console.error('Failed to fetch products:', productsResult.reason);
      }

      // Handle invoices
      const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];
      if (invoicesResult.status === 'rejected') {
        console.error('Failed to fetch invoices:', invoicesResult.reason);
      }

      console.log('Fetched data:', { customers: customers.length, products: products.length, invoices: invoices.length });

      // Calculate statistics safely
      const totalRevenue = Array.isArray(invoices) 
        ? invoices.reduce((sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 0)
        : 0;
        
      const paidInvoices = Array.isArray(invoices) 
        ? invoices.filter(inv => inv.status === 'PAID').length 
        : 0;
        
      const unpaidInvoices = Array.isArray(invoices) 
        ? invoices.filter(inv => inv.status === 'UNPAID').length 
        : 0;
        
      const overdueInvoices = Array.isArray(invoices) 
        ? invoices.filter(inv => inv.status === 'OVERDUE').length 
        : 0;

      setStats({
        customers: Array.isArray(customers) ? customers.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        totalInvoices: Array.isArray(invoices) ? invoices.length : 0,
        totalRevenue,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
      });

      // Get recent invoices (last 5) safely
      if (Array.isArray(invoices) && invoices.length > 0) {
        const sortedInvoices = invoices
          .filter(invoice => invoice.createdAt) // Only include invoices with createdAt
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentInvoices(sortedInvoices);
      } else {
        setRecentInvoices([]);
      }

      // Hide troubleshooting panel if everything is working
      setShowTroubleshooting(false);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
      setShowTroubleshooting(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Loading dashboard data...</p>
        {connectionStatus && !connectionStatus.success && (
          <p className="text-sm text-red-600">Connection issue detected</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to your billing management system
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowTroubleshooting(!showTroubleshooting)} 
            variant="outline" 
            size="sm"
          >
            {showTroubleshooting ? 'Hide' : 'Show'} Diagnostics
          </Button>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RefreshIcon />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className={`rounded-md p-3 ${connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-sm ${connectionStatus.success ? 'text-green-800' : 'text-yellow-800'}`}>
            Backend Status: {connectionStatus.message}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Panel */}
      {showTroubleshooting && <TroubleshootingPanel />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.customers}
          icon={UsersIcon}
          color="border-blue-500"
          link="/customers"
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={PackageIcon}
          color="border-green-500"
          link="/products"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileTextIcon}
          color="border-purple-500"
          link="/invoices"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSignIcon}
          color="border-yellow-500"
        />
      </div>

      {/* Invoice Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paid Invoices</h3>
          <div className="text-3xl font-bold text-green-600">{stats.paidInvoices}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Unpaid Invoices</h3>
          <div className="text-3xl font-bold text-yellow-600">{stats.unpaidInvoices}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overdue Invoices</h3>
          <div className="text-3xl font-bold text-red-600">{stats.overdueInvoices}</div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
            <Link
              to="/invoices"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <p>No invoices found</p>
                      <Link to="/invoices/create">
                        <Button size="sm">Create your first invoice</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-500">
                        {invoice.invoiceNumber || `INV-${invoice.id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
