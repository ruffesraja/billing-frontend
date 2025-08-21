import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, invoiceAPI, testConnection } from '../services/api';
import { formatCurrency, getStatusColor } from '../utils/helpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import TroubleshootingPanel from '../components/TroubleshootingPanel';
import DateFilter from '../components/DateFilter';
import { 
  PackageIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  RefreshIcon, 
  TrendingUpIcon,
  AddIcon,
  ViewIcon,
  FilterIcon
} from '../components/ui/Icons';

const StatCard = ({ title, value, icon: Icon, color, link, loading = false, trend, trendValue }) => {
  const content = (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUpIcon className={`w-4 h-4 ${trend === 'down' ? 'transform rotate-180' : ''}`} />
                  <span className="ml-1">{trendValue}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`w-8 h-8 ${color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Date filter states
  const [dateFilter, setDateFilter] = useState('this_week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection first
      const connectionResult = await testConnection();
      setConnectionStatus(connectionResult);

      if (!connectionResult.success) {
        throw new Error(connectionResult.message);
      }

      // Build filters object for invoices
      const filters = {};
      
      if (dateFilter === 'custom' && customStartDate && customEndDate) {
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      } else if (dateFilter && dateFilter !== 'custom') {
        filters.dateFilter = dateFilter;
      }

      // Fetch data in parallel
      const [invoicesResponse, productsResponse] = await Promise.all([
        invoiceAPI.getAll(filters),
        productAPI.getAll()
      ]);

      // Calculate statistics
      const totalInvoices = invoicesResponse.length;
      const totalProducts = productsResponse.length;
      const totalRevenue = invoicesResponse.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
      const pendingInvoices = invoicesResponse.filter(invoice => invoice.status === 'UNPAID').length;

      setStats({
        totalInvoices,
        totalProducts,
        totalRevenue,
        pendingInvoices
      });

      // Get recent invoices (last 5)
      const sortedInvoices = invoicesResponse
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentInvoices(sortedInvoices);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, customStartDate, customEndDate]);

  // Handle date filter changes
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setShowCustomDateRange(filter === 'custom');
    
    if (filter !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const clearFilters = () => {
    setDateFilter('this_week');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDateRange(false);
  };

  const getFilterLabel = () => {
    if (!dateFilter || dateFilter === '') return 'All Time';
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    const option = dateFilter;
    return option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error && !connectionStatus?.success) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={fetchDashboardData} variant="secondary">
            <RefreshIcon className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
        <TroubleshootingPanel error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your billing operations
            {dateFilter && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtered: {getFilterLabel()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="secondary"
            className={dateFilter && dateFilter !== 'this_week' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
            {dateFilter && dateFilter !== 'this_week' && <span className="ml-1 text-xs bg-blue-200 text-blue-800 rounded-full px-1">1</span>}
          </Button>
          <Button onClick={fetchDashboardData} variant="secondary">
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/invoices/create">
            <Button>
              <AddIcon className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FilterIcon className="w-5 h-5 mr-2" />
              Date Filters
            </h3>
            {dateFilter && dateFilter !== 'this_week' && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset to This Week
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DateFilter
                dateFilter={dateFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                showCustomDateRange={showCustomDateRange}
                onDateFilterChange={handleDateFilterChange}
                onCustomStartDateChange={setCustomStartDate}
                onCustomEndDateChange={setCustomEndDate}
                placeholder="Select date range"
              />
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Data Period: {getFilterLabel()}</p>
                <p className="text-xs mt-1">Statistics reflect the selected date range</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {/* {connectionStatus && (
        <div className={`p-4 rounded-lg ${
          connectionStatus.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            connectionStatus.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {connectionStatus.success ? '✅ Backend Connected' : '❌ Backend Connection Failed'}: {connectionStatus.message}
          </p>
        </div>
      )} */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileTextIcon}
          color="border-l-blue-500"
          link="/invoices"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSignIcon}
          color="border-l-green-500"
          loading={loading}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={FileTextIcon}
          color="border-l-yellow-500"
          link="/invoices?status=UNPAID"
          loading={loading}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={PackageIcon}
          color="border-l-purple-500"
          link="/products"
          loading={loading}
        />
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
            <Link to="/invoices">
              <Button variant="secondary" size="sm">
                <ViewIcon className="w-4 h-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">No invoices found</p>
              <Link to="/invoices/create">
                <Button>
                  <AddIcon className="w-4 h-4 mr-2" />
                  Create Your First Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Invoice #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-blue-600">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                                <div>
          <p className="font-medium text-gray-900">{invoice.customerName}</p>
          <p className="text-sm text-gray-700">{invoice.customerEmail}</p>
        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/invoices/${invoice.id}`}>
                          <Button variant="secondary" size="sm">
                            <ViewIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-black font-semibold mb-2">Create New Invoice</h3>
            <p className="text-black mb-4">Start billing your customers with our streamlined invoice creation process.</p>
          <Link to="/invoices/create">
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <AddIcon className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>
        
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-black font-semibold mb-2">Manage Products</h3>
            <p className="text-black mb-4">Add and organize your products for quick invoice creation.</p>
          <Link to="/products">
            <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <PackageIcon className="w-4 h-4 mr-2" />
              Manage Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
