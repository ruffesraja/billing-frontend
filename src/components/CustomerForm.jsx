import React, { useState, useEffect } from 'react';
import { isValidEmail, isValidPhone, validateRequired } from '../utils/helpers';
import Button from './ui/Button';
import Input from './ui/Input';

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    } else {
      // Reset form for new customer
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    // Clear errors when customer changes
    setErrors({});
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateRequired(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    // Validate email
    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      newErrors.email = emailError;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone
    const phoneError = validateRequired(formData.phone, 'Phone number');
    if (phoneError) {
      newErrors.phone = phoneError;
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    // Validate address
    const addressError = validateRequired(formData.address, 'Address');
    if (addressError) newErrors.address = addressError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      
      // Trim whitespace from all fields
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };
      
      console.log('Submitting cleaned data:', cleanedData);
      await onSubmit(cleanedData);
      
      // If successful, reset form for new entries
      if (!customer) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setErrors({ submit: err.message || 'An error occurred while saving the customer' });
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
          label="Name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter customer name"
          disabled={loading}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter email address"
          disabled={loading}
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Enter phone number"
          disabled={loading}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            rows={3}
            required
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter full address"
            disabled={loading}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
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
            {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Create Customer')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
