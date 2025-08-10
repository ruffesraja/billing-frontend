import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { formatDate, debounce, filterBySearch } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

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

// Simple Product Form Component
const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: product?.name || ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name *"
        value={formData.name}
        onChange={(e) => {
          setFormData({ name: e.target.value });
          if (errors.name) setErrors({});
        }}
        error={errors.name}
        placeholder="Enter product name"
        autoFocus
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search function
  const debouncedSearch = debounce((term) => {
    const filtered = filterBySearch(products, term, ['name']);
    setFilteredProducts(filtered);
  }, 300);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle search
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, products]);

  // Handle create/update product
  const handleSubmitProduct = async (formData) => {
    try {
      setSubmitting(true);
      
      if (editingProduct) {
        await productAPI.update(editingProduct.id, formData);
      } else {
        await productAPI.create(formData);
      }
      
      await loadProducts();
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productAPI.delete(product.id);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // Handle create new product
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog for invoicing</p>
        </div>
        <Button onClick={handleCreateProduct}>
          <PlusIcon />
          <span className="ml-2">Add Product</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            onClick={loadProducts} 
            variant="secondary" 
            size="sm" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No products match "${searchTerm}"`
                : 'Get started by creating your first product'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateProduct}>
                <PlusIcon />
                <span className="ml-2">Add Your First Product</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          variant="secondary"
                          size="sm"
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product)}
                          variant="danger"
                          size="sm"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmitProduct}
          onCancel={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Products;
