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

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    let filtered = filterBySearch(invoices, term, ['invoiceNumber', 'customer.name', 'customer.email']);
    
    if (statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    setFilteredInvoices(filtered);
  }, 300);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceAPI.getAll();
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
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
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'PAID' ? 'success' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('PAID')}
          >
            Paid
          </Button>
          <Button
            variant={statusFilter === 'UNPAID' ? 'warning' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('UNPAID')}
          >
            Unpaid
          </Button>
          <Button
            variant={statusFilter === 'OVERDUE' ? 'danger' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('OVERDUE')}
          >
            Overdue
          </Button>
        </div>
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
                  {searchTerm || statusFilter ? 'No invoices found matching your criteria.' : 'No invoices found. Create your first invoice!'}
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
                      <div className="font-medium">{invoice.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{invoice.customer?.email || ''}</div>
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
