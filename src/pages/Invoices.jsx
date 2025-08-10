import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor, debounce, filterBySearch } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

// Simple icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

// Date filter options
const DATE_FILTER_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

// Helper function to format date for input
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    let filtered = filterBySearch(invoices, term, ['invoiceNumber', 'customerName', 'customerEmail']);
    setFilteredInvoices(filtered);
  }, 300);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Build filters object
      const filters = {};
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (dateFilter === 'custom' && customStartDate && customEndDate) {
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      } else if (dateFilter && dateFilter !== 'custom') {
        filters.dateFilter = dateFilter;
      }
      
      const data = await invoiceAPI.getAll(filters);
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id) => {
    try {
      await invoiceAPI.delete(id);
      await fetchInvoices();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setShowCustomDateRange(filter === 'custom');
    
    if (filter !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDateRange(false);
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (dateFilter) count++;
    if (searchTerm) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your billing invoices
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/invoices/create">
            <Button>
              <PlusIcon />
              <span className="ml-2">Create Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FilterIcon />
            <span className="ml-2">Filters</span>
          </h3>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {DATE_FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Invoice Count */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{filteredInvoices.length}</span>
            <span className="ml-1">invoice{filteredInvoices.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
        
        {/* Custom Date Range */}
        {showCustomDateRange && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Invoice #</Table.Head>
              <Table.Head>Customer</Table.Head>
              <Table.Head>Amount</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Invoice Date</Table.Head>
              <Table.Head>Due Date</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredInvoices.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan="7" className="text-center text-gray-500 py-8">
                  {searchTerm || statusFilter || dateFilter ? 
                    'No invoices found matching your criteria.' : 
                    'No invoices found. Create your first invoice!'
                  }
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredInvoices.map((invoice) => (
                <Table.Row key={invoice.id}>
                  <Table.Cell className="font-medium">
                    {invoice.invoiceNumber}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{invoice.customerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail || ''}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    {formatCurrency(invoice.totalAmount)}
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{formatDate(invoice.invoiceDate)}</Table.Cell>
                  <Table.Cell>{formatDate(invoice.dueDate)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Link to={`/invoices/${invoice.id}`}>
                        <Button size="sm" variant="outline">
                          <EyeIcon />
                        </Button>
                      </Link>
                      <Link to={`/invoices/${invoice.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <EditIcon />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteConfirm(invoice)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete invoice <strong>{deleteConfirm?.invoiceNumber}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteInvoice(deleteConfirm.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
