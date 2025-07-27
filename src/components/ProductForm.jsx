import React, { useState, useEffect } from 'react';
import { validateRequired, validateNumber } from '../utils/helpers';
import Button from './ui/Button';
import Input from './ui/Input';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitPrice: '',
    taxPercent: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        unitPrice: product.unitPrice?.toString() || '',
        taxPercent: product.taxPercent?.toString() || '',
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        unitPrice: '',
        taxPercent: '',
      });
    }
    // Clear errors when product changes
    setErrors({});
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateRequired(formData.name, 'Product name');
    if (nameError) newErrors.name = nameError;

    // Validate description
    const descriptionError = validateRequired(formData.description, 'Description');
    if (descriptionError) newErrors.description = descriptionError;

    // Validate unit price
    const priceError = validateRequired(formData.unitPrice, 'Unit price');
    if (priceError) {
      newErrors.unitPrice = priceError;
    } else {
      const priceValidation = validateNumber(formData.unitPrice, 'Unit price', 0);
      if (priceValidation) newErrors.unitPrice = priceValidation;
    }

    // Validate tax percent
    const taxError = validateRequired(formData.taxPercent, 'Tax percentage');
    if (taxError) {
      newErrors.taxPercent = taxError;
    } else {
      const taxValidation = validateNumber(formData.taxPercent, 'Tax percentage', 0, 100);
      if (taxValidation) newErrors.taxPercent = taxValidation;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Product form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Product form validation failed:', errors);
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      
      // Convert strings to numbers and trim whitespace
      const cleanedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        unitPrice: parseFloat(formData.unitPrice),
        taxPercent: parseFloat(formData.taxPercent),
      };
      
      // Validate converted numbers
      if (isNaN(cleanedData.unitPrice) || cleanedData.unitPrice < 0) {
        throw new Error('Unit price must be a valid positive number');
      }
      
      if (isNaN(cleanedData.taxPercent) || cleanedData.taxPercent < 0 || cleanedData.taxPercent > 100) {
        throw new Error('Tax percentage must be a valid number between 0 and 100');
      }
      
      console.log('Submitting cleaned product data:', cleanedData);
      await onSubmit(cleanedData);
      
      // If successful, reset form for new entries
      if (!product) {
        setFormData({
          name: '',
          description: '',
          unitPrice: '',
          taxPercent: '',
        });
      }
    } catch (err) {
      console.error('Product form submission error:', err);
      setErrors({ submit: err.message || 'An error occurred while saving the product' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user makes changes
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  return (
    <div className="space-y-4">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter product name"
          disabled={loading}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            disabled={loading}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Unit Price ($)"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.unitPrice}
            onChange={handleChange}
            error={errors.unitPrice}
            placeholder="0.00"
            disabled={loading}
          />

          <Input
            label="Tax Percentage (%)"
            name="taxPercent"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            value={formData.taxPercent}
            onChange={handleChange}
            error={errors.taxPercent}
            placeholder="0.00"
            disabled={loading}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
