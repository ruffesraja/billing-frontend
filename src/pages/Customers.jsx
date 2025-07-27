import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { formatDate, debounce, filterBySearch } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SimpleModal from '../components/ui/SimpleModal';
import CustomerForm from '../components/CustomerForm';
import ApiTester from '../components/ApiTester';

// Simple icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

const BugIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [operationLoading, setOperationLoading] = useState({});

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    const filtered = filterBySearch(customers, term, ['name', 'email', 'phone', 'address']);
    setFilteredCustomers(filtered);
  }, 300);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching customers...');
      
      const data = await customerAPI.getAll();
      console.log('Customers fetched successfully:', data);
      
      if (Array.isArray(data)) {
        setCustomers(data);
        setFilteredCustomers(data);
      } else {
        console.warn('Expected array but got:', typeof data, data);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    console.log('🔵 Opening create customer modal');
    console.log('🔵 Current modal state:', isModalOpen);
    setEditingCustomer(null);
    setIsModalOpen(true);
    console.log('🔵 Modal state after setting to true:', true);
  };

  const handleEditCustomer = (customer) => {
    console.log('🔵 Opening edit customer modal for:', customer);
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('🔵 Closing modal');
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id) => {
    try {
      setOperationLoading(prev => ({ ...prev, [`delete_${id}`]: true }));
      console.log('Deleting customer with ID:', id);
      
      await customerAPI.delete(id);
      console.log('Customer deleted successfully');
      
      // Refresh the customer list
      await fetchCustomers();
      setDeleteConfirm(null);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(`Failed to delete customer: ${err.message}`);
    } finally {
      setOperationLoading(prev => ({ ...prev, [`delete_${id}`]: false }));
    }
  };

  const handleFormSubmit = async (customerData) => {
    try {
      console.log('Submitting customer form:', customerData);
      
      if (editingCustomer) {
        console.log('Updating customer:', editingCustomer.id);
        const result = await customerAPI.update(editingCustomer.id, customerData);
        console.log('Customer updated successfully:', result);
      } else {
        console.log('Creating new customer');
        const result = await customerAPI.create(customerData);
        console.log('Customer created successfully:', result);
      }
      
      // Refresh the customer list
      await fetchCustomers();
      
      // Close modal and reset form
      setIsModalOpen(false);
      setEditingCustomer(null);
      setError(null);
      
    } catch (err) {
      console.error('Error submitting customer form:', err);
      // Let the form component handle the error display
      throw err;
    }
  };

  const handleRetry = () => {
    fetchCustomers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your customer database ({customers.length} total)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            onClick={() => setShowDebugPanel(!showDebugPanel)} 
            variant="outline" 
            size="sm"
          >
            <BugIcon />
            <span className="ml-2">{showDebugPanel ? 'Hide' : 'Debug'}</span>
          </Button>
          <Button onClick={handleCreateCustomer}>
            <PlusIcon />
            <span className="ml-2">Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Modal Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-sm text-yellow-800">
          <strong>Modal Debug:</strong> Modal is currently {isModalOpen ? 'OPEN' : 'CLOSED'}
          {editingCustomer && ` | Editing: ${editingCustomer.name}`}
        </p>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && <ApiTester />}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Button onClick={handleRetry} size="sm" variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <Input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Email</Table.Head>
              <Table.Head>Phone</Table.Head>
              <Table.Head>Address</Table.Head>
              <Table.Head>Created</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredCustomers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan="6" className="text-center text-gray-500 py-8">
                  <div className="space-y-3">
                    {searchTerm ? (
                      <p>No customers found matching "{searchTerm}".</p>
                    ) : (
                      <>
                        <p>No customers found.</p>
                        <Button onClick={handleCreateCustomer} size="sm">
                          Create your first customer
                        </Button>
                      </>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredCustomers.map((customer) => (
                <Table.Row key={customer.id}>
                  <Table.Cell className="font-medium">
                    {customer.name}
                  </Table.Cell>
                  <Table.Cell>{customer.email}</Table.Cell>
                  <Table.Cell>{customer.phone}</Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {customer.address}
                  </Table.Cell>
                  <Table.Cell>{formatDate(customer.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCustomer(customer)}
                        title="Edit customer"
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteConfirm(customer)}
                        loading={operationLoading[`delete_${customer.id}`]}
                        title="Delete customer"
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

      {/* Customer Form Modal - Using SimpleModal */}
      <SimpleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This action cannot be undone and will remove all associated data.
              </p>
            </div>
          </div>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={operationLoading[`delete_${deleteConfirm?.id}`]}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteCustomer(deleteConfirm.id)}
              loading={operationLoading[`delete_${deleteConfirm?.id}`]}
            >
              {operationLoading[`delete_${deleteConfirm?.id}`] ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
};

export default Customers;
