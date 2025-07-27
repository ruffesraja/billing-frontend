import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { formatCurrency, formatDate, debounce, filterBySearch } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/ProductForm';
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [operationLoading, setOperationLoading] = useState({});

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    const filtered = filterBySearch(products, term, ['name', 'description']);
    setFilteredProducts(filtered);
  }, 300);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products...');
      
      const data = await productAPI.getAll();
      console.log('Products fetched successfully:', data);
      
      if (Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        console.warn('Expected array but got:', typeof data, data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    console.log('Opening create product modal');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    console.log('Opening edit product modal for:', product);
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      setOperationLoading(prev => ({ ...prev, [`delete_${id}`]: true }));
      console.log('Deleting product with ID:', id);
      
      await productAPI.delete(id);
      console.log('Product deleted successfully');
      
      // Refresh the product list
      await fetchProducts();
      setDeleteConfirm(null);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(`Failed to delete product: ${err.message}`);
    } finally {
      setOperationLoading(prev => ({ ...prev, [`delete_${id}`]: false }));
    }
  };

  const handleFormSubmit = async (productData) => {
    try {
      console.log('Submitting product form:', productData);
      
      if (editingProduct) {
        console.log('Updating product:', editingProduct.id);
        const result = await productAPI.update(editingProduct.id, productData);
        console.log('Product updated successfully:', result);
      } else {
        console.log('Creating new product');
        const result = await productAPI.create(productData);
        console.log('Product created successfully:', result);
      }
      
      // Refresh the product list
      await fetchProducts();
      
      // Close modal and reset form
      setIsModalOpen(false);
      setEditingProduct(null);
      setError(null);
      
    } catch (err) {
      console.error('Error submitting product form:', err);
      // Let the form component handle the error display
      throw err;
    }
  };

  const handleRetry = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalog ({products.length} total)
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
          <Button onClick={handleCreateProduct}>
            <PlusIcon />
            <span className="ml-2">Add Product</span>
          </Button>
        </div>
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
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Description</Table.Head>
              <Table.Head>Unit Price</Table.Head>
              <Table.Head>Tax %</Table.Head>
              <Table.Head>Created</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredProducts.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan="6" className="text-center text-gray-500 py-8">
                  <div className="space-y-3">
                    {searchTerm ? (
                      <p>No products found matching "{searchTerm}".</p>
                    ) : (
                      <>
                        <p>No products found.</p>
                        <Button onClick={handleCreateProduct} size="sm">
                          Create your first product
                        </Button>
                      </>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredProducts.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell className="font-medium">
                    {product.name}
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {product.description}
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    {formatCurrency(product.unitPrice)}
                  </Table.Cell>
                  <Table.Cell>
                    {product.taxPercent}%
                  </Table.Cell>
                  <Table.Cell>{formatDate(product.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        title="Edit product"
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteConfirm(product)}
                        loading={operationLoading[`delete_${product.id}`]}
                        title="Delete product"
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

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
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
                This action cannot be undone and may affect existing invoices.
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
              onClick={() => handleDeleteProduct(deleteConfirm.id)}
              loading={operationLoading[`delete_${deleteConfirm?.id}`]}
            >
              {operationLoading[`delete_${deleteConfirm?.id}`] ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
