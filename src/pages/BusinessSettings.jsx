import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BusinessSettings = () => {
  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    ownerName: '',
    gstNumber: '',
    
    // Address Details
    addressLine1: '',
    addressLine2: '',
    area: '',
    city: '',
    pincode: '',
    state: '',
    
    // Contact Information
    contactNumber: '',
    email: '',
    website: '',
    
    // Primary Bank Account
    primaryBankName: '',
    primaryAccountNumber: '',
    primaryIfscCode: '',
    primaryAccountHolderName: '',
    
    // Secondary Bank Account
    secondaryBankName: '',
    secondaryAccountNumber: '',
    secondaryIfscCode: '',
    secondaryAccountHolderName: '',
    
    // Invoice Configuration
    invoiceHeaderText: '',
    invoiceFooterText: '',
    businessLogoPath: '',
    
    // Header Configuration
    headerGodSymbol: '',
    headerName: '',
    
    defaultCgstRate: 9.0,
    defaultSgstRate: 9.0,
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1,
    termsAndConditions: '',
    paymentTerms: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const owners = await ownerAPI.getAll();
      if (owners && owners.length > 0) {
        const activeOwner = owners.find(owner => owner.isActive) || owners[0];
        setFormData({
          businessName: activeOwner.businessName || '',
          ownerName: activeOwner.ownerName || '',
          gstNumber: activeOwner.gstNumber || '',
          addressLine1: activeOwner.addressLine1 || '',
          addressLine2: activeOwner.addressLine2 || '',
          area: activeOwner.area || '',
          city: activeOwner.city || '',
          pincode: activeOwner.pincode || '',
          state: activeOwner.state || '',
          contactNumber: activeOwner.contactNumber || '',
          email: activeOwner.email || '',
          website: activeOwner.website || '',
          primaryBankName: activeOwner.primaryBankName || '',
          primaryAccountNumber: activeOwner.primaryAccountNumber || '',
          primaryIfscCode: activeOwner.primaryIfscCode || '',
          primaryAccountHolderName: activeOwner.primaryAccountHolderName || '',
          secondaryBankName: activeOwner.secondaryBankName || '',
          secondaryAccountNumber: activeOwner.secondaryAccountNumber || '',
          secondaryIfscCode: activeOwner.secondaryIfscCode || '',
          secondaryAccountHolderName: activeOwner.secondaryAccountHolderName || '',
          invoiceHeaderText: activeOwner.invoiceHeaderText || '',
          invoiceFooterText: activeOwner.invoiceFooterText || '',
          businessLogoPath: activeOwner.businessLogoPath || '',
          headerGodSymbol: activeOwner.headerGodSymbol || '',
          headerName: activeOwner.headerName || '',
          defaultCgstRate: activeOwner.defaultCgstRate || 9.0,
          defaultSgstRate: activeOwner.defaultSgstRate || 9.0,
          invoicePrefix: activeOwner.invoicePrefix || 'INV',
          nextInvoiceNumber: activeOwner.nextInvoiceNumber || 1,
          termsAndConditions: activeOwner.termsAndConditions || '',
          paymentTerms: activeOwner.paymentTerms || ''
        });
        setOwnerId(activeOwner.id);
      }
    } catch (error) {
      console.error('Error loading owner data:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.defaultCgstRate < 0) {
      newErrors.defaultCgstRate = 'CGST rate cannot be negative';
    }
    if (formData.defaultSgstRate < 0) {
      newErrors.defaultSgstRate = 'SGST rate cannot be negative';
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
      setSaving(true);
      setSuccess('');
      
      if (ownerId) {
        await ownerAPI.update(ownerId, formData);
        setSuccess('Business settings updated successfully!');
      } else {
        const newOwner = await ownerAPI.create(formData);
        setOwnerId(newOwner.id);
        setSuccess('Business settings created successfully!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving business settings:', error);
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600">Configure your business information and invoice settings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              error={errors.businessName}
              placeholder="Enter business name"
            />
            <Input
              label="Owner Name *"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              error={errors.ownerName}
              placeholder="Enter owner name"
            />
            <Input
              label="GST Number"
              value={formData.gstNumber}
              onChange={(e) => handleInputChange('gstNumber', e.target.value)}
              placeholder="Enter GST number"
            />
            <Input
              label="Contact Number *"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              error={errors.contactNumber}
              placeholder="Enter contact number"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter email address"
            />
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="Enter website URL"
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              placeholder="Enter address line 1"
            />
            <Input
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              placeholder="Enter address line 2"
            />
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="Enter area"
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
            />
            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="Enter pincode"
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state"
            />
          </div>
        </div>

        {/* Primary Bank Account */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Bank Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bank Name"
              value={formData.primaryBankName}
              onChange={(e) => handleInputChange('primaryBankName', e.target.value)}
              placeholder="Enter bank name"
            />
            <Input
              label="Account Number"
              value={formData.primaryAccountNumber}
              onChange={(e) => handleInputChange('primaryAccountNumber', e.target.value)}
              placeholder="Enter account number"
            />
            <Input
              label="IFSC Code"
              value={formData.primaryIfscCode}
              onChange={(e) => handleInputChange('primaryIfscCode', e.target.value)}
              placeholder="Enter IFSC code"
            />
            <Input
              label="Account Holder Name"
              value={formData.primaryAccountHolderName}
              onChange={(e) => handleInputChange('primaryAccountHolderName', e.target.value)}
              placeholder="Enter account holder name"
            />
          </div>
        </div>

        {/* Secondary Bank Account */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Bank Account (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bank Name"
              value={formData.secondaryBankName}
              onChange={(e) => handleInputChange('secondaryBankName', e.target.value)}
              placeholder="Enter bank name"
            />
            <Input
              label="Account Number"
              value={formData.secondaryAccountNumber}
              onChange={(e) => handleInputChange('secondaryAccountNumber', e.target.value)}
              placeholder="Enter account number"
            />
            <Input
              label="IFSC Code"
              value={formData.secondaryIfscCode}
              onChange={(e) => handleInputChange('secondaryIfscCode', e.target.value)}
              placeholder="Enter IFSC code"
            />
            <Input
              label="Account Holder Name"
              value={formData.secondaryAccountHolderName}
              onChange={(e) => handleInputChange('secondaryAccountHolderName', e.target.value)}
              placeholder="Enter account holder name"
            />
          </div>
        </div>

        {/* Invoice Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default CGST Rate (%)"
              type="number"
              step="0.01"
              min="0"
              value={formData.defaultCgstRate}
              onChange={(e) => handleInputChange('defaultCgstRate', parseFloat(e.target.value) || 0)}
              error={errors.defaultCgstRate}
            />
            <Input
              label="Default SGST Rate (%)"
              type="number"
              step="0.01"
              min="0"
              value={formData.defaultSgstRate}
              onChange={(e) => handleInputChange('defaultSgstRate', parseFloat(e.target.value) || 0)}
              error={errors.defaultSgstRate}
            />
            <Input
              label="Invoice Prefix"
              value={formData.invoicePrefix}
              onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
              placeholder="e.g., INV"
            />
            <Input
              label="Next Invoice Number"
              type="number"
              min="1"
              value={formData.nextInvoiceNumber}
              onChange={(e) => handleInputChange('nextInvoiceNumber', parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="mt-4 space-y-4">
            {/* Header Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Header God Symbol"
                value={formData.headerGodSymbol}
                onChange={(e) => handleInputChange('headerGodSymbol', e.target.value)}
                placeholder="e.g., ॐ (converts to OM), *, +, O"
                helpText="Symbols like ॐ, ஓம், 🕉️ will be converted to 'OM' in PDF for better compatibility"
              />
              <Input
                label="Header Name"
                value={formData.headerName}
                onChange={(e) => handleInputChange('headerName', e.target.value)}
                placeholder="e.g., Sri Periyandavar Thunal"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Header Text
              </label>
              <textarea
                value={formData.invoiceHeaderText}
                onChange={(e) => handleInputChange('invoiceHeaderText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Custom header text for invoices"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Footer Text
              </label>
              <textarea
                value={formData.invoiceFooterText}
                onChange={(e) => handleInputChange('invoiceFooterText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Custom footer text for invoices"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions
              </label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Business terms and conditions"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <textarea
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Payment terms (e.g., Net 30 days)"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" loading={saving}>
            {ownerId ? 'Update Settings' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BusinessSettings;
