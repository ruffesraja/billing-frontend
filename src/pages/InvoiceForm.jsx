import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { invoiceAPI, customerAPI, productAPI } from '../services/api';
import { formatDateForInput, calculateInvoiceTotals, formatCurrency } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Simple icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: formatDateForInput(new Date()),
    dueDate: '',
    status: 'UNPAID',
    notes: '',
    items: [{ productId: '', quantity: 1 }],
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      fetchInvoice();
    }
  }, [id, isEditing]);

  const fetchInitialData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        customerAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoice = async () => {
    try {
      const invoice = await invoiceAPI.getById(id);
      setFormData({
        customerId: invoice.customer?.id?.toString() || '',
        invoiceDate: formatDateForInput(invoice.invoiceDate),
        dueDate: formatDateForInput(invoice.dueDate),
        status: invoice.status || 'UNPAID',
        notes: invoice.notes || '',
        items: invoice.invoiceItems?.map(item => ({
          productId: item.product?.id?.toString() || '',
          quantity: item.quantity || 1,
        })) || [{ productId: '', quantity: 1 }],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productId) {
          newErrors[`item_${index}_product`] = 'Product is required';
        }
        if (!item.quantity || item.quantity < 1) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        customerId: parseInt(formData.customerId),
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: formData.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
        })),
      };

      if (isEditing) {
        submitData.status = formData.status;
        await invoiceAPI.update(id, submitData);
      } else {
        await invoiceAPI.create(submitData);
      }

      navigate('/invoices');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    // Clear errors
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const calculatePreviewTotals = () => {
    const items = formData.items.map(item => {
      const product = products.find(p => p.id.toString() === item.productId);
      if (!product) return null;
      
      return {
        quantity: parseInt(item.quantity) || 0,
        unitPrice: product.unitPrice,
        taxPercent: product.taxPercent,
      };
    }).filter(Boolean);

    return calculateInvoiceTotals(items);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
        <Link to="/invoices">
          <Button variant="outline">
            <ArrowLeftIcon />
            <span className="ml-2">Back to Invoices</span>
          </Button>
        </Link>
      </div>
    );
  }

  const totals = calculatePreviewTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditing ? 'Update invoice details' : 'Create a new invoice for your customer'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.customerId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                `}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Invoice Date"
              name="invoiceDate"
              type="date"
              required
              value={formData.invoiceDate}
              onChange={handleChange}
              error={errors.invoiceDate}
            />

            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              required
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
            />
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <PlusIcon />
                <span className="ml-2">Add Item</span>
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors[`item_${index}_product`] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                      `}
                    >
                      <option value="">Select a product</option>
                      {products.map(product => {
                        const isSelectedElsewhere = formData.items.some(
                          (itm, idx) => idx !== index && itm.productId === product.id.toString()
                        );
                        return (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={isSelectedElsewhere}
                          >
                            {product.name} - {formatCurrency(product.unitPrice)}
                          </option>
                        );
                      })}
                    </select>
                    {errors[`item_${index}_product`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      className={`
                        block w-full px-3 py-2 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors[`item_${index}_quantity`] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                      `}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div className="flex items-end">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <TrashIcon />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Preview */}
          {totals.total > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Invoice Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(totals.totalTax)}</span>
                </div>
                <div className="flex justify-between font-medium text-base border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or terms..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-6 border-t">
            <Link to="/invoices" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={submitting}
              className="flex-1"
            >
              {isEditing ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
