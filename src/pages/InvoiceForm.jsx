import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { invoiceAPI, productAPI, ownerAPI } from '../services/api';
import { formatDateForInput, formatCurrency } from '../utils/helpers';
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
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    // Customer details (entered directly)
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGstNumber: '',
    
    // Invoice details
    invoiceDate: formatDateForInput(new Date()),
    dueDate: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    status: 'UNPAID', // Default status
    notes: '',
    
    // GST settings
    gstApplicable: false,
    gstPercent: 0, // Will be loaded from business settings
    
    // Additional charges
    transportChargesApplicable: false,
    transportChargesLabel: 'Transport Charges',
    transportCharges: null,
    
    // Line items with dynamic pricing (no per-item tax)
    items: [{
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 1,
      isCustomProduct: false
    }]
  });

  const [products, setProducts] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // Track which fields have been touched

  // Load products, business settings, and invoice data (if editing)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Refresh current date for new invoices (not editing)
        if (!isEditing) {
          const now = new Date();
          console.log('Current date:', now);
          console.log('Formatted invoice date:', formatDateForInput(now));
          console.log('Formatted due date:', formatDateForInput(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)));
          setFormData(prev => ({
            ...prev,
            invoiceDate: formatDateForInput(now),
            dueDate: formatDateForInput(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
          }));
        }
        
        // Load products FIRST
        const productsData = await productAPI.getAll();
        setProducts(productsData);
        console.log('Products loaded:', productsData);

        // Load business settings for default GST values
        try {
          const owners = await ownerAPI.getAll();
          if (owners && owners.length > 0) {
            const activeOwner = owners.find(owner => owner.isActive) || owners[0];
            setBusinessSettings(activeOwner);
            
            // Set default GST percentage from business settings
            if (activeOwner.defaultCgstRate && activeOwner.defaultSgstRate) {
              const defaultGstPercent = activeOwner.defaultCgstRate + activeOwner.defaultSgstRate;
              setFormData(prev => ({
                ...prev,
                gstPercent: defaultGstPercent
              }));
            }
          }
        } catch (error) {
          console.warn('Could not load business settings:', error);
        }

        // Load invoice data if editing (AFTER products are loaded)
        if (isEditing) {
          const invoiceData = await invoiceAPI.getById(id);
          
          // Debug logging for product data
          console.log('Loading invoice data:', invoiceData);
          console.log('Line items:', invoiceData.lineItems);
          
          // Now resolve products with the loaded products array
          const resolvedItems = invoiceData.lineItems?.map(item => {
            console.log('Processing item:', item);
            
            // Always check if the product name exists in current products list
            let resolvedProductId = item.productId;
            let isDeletedProduct = false;
            
            if (item.productName && item.productName.trim() !== '') {
              const matchingProduct = productsData.find(p => p.name === item.productName);
              if (matchingProduct) {
                // Product exists in current list, use its real ID
                resolvedProductId = matchingProduct.id;
                console.log('Found matching product by name:', matchingProduct);
              } else {
                // Product not found in current list - it's deleted
                isDeletedProduct = true;
                console.log('Product not found in active products - likely deleted:', item.productName);
                // Create a virtual product ID for deleted products so they can be selected in dropdown
                resolvedProductId = `deleted_${item.productName}`;
              }
            }
            
            // Use the helper function to determine if this should be a custom product
            const isCustom = shouldBeCustomProduct({
              ...item,
              productId: resolvedProductId,
              isCustomProduct: item.isCustomProduct
            });
            console.log('Item custom detection:', { 
              originalProductId: item.productId, 
              resolvedProductId, 
              productName: item.productName, 
              isCustomProduct: item.isCustomProduct, 
              calculatedIsCustom: isCustom,
              isDeletedProduct
            });
            
                          return {
                productId: resolvedProductId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                // For deleted products, don't mark as custom initially so they show in dropdown
                isCustomProduct: isCustom
              };
          }) || [{
            productId: '',
            productName: '',
            productDescription: '',
            quantity: 1,
            unitPrice: 1,
            isCustomProduct: false
          }];
          
          console.log('Resolved items:', resolvedItems);
          
          setFormData(prev => ({
            ...prev,
            customerName: invoiceData.customerName || '',
            customerEmail: invoiceData.customerEmail || '',
            customerPhone: invoiceData.customerPhone || '',
            customerAddress: invoiceData.customerAddress || '',
            customerGstNumber: invoiceData.customerGstNumber || '',
            invoiceDate: formatDateForInput(new Date(invoiceData.invoiceDate)),
            dueDate: formatDateForInput(new Date(invoiceData.dueDate)),
            status: invoiceData.status || 'UNPAID',
            notes: invoiceData.notes || '',
            gstApplicable: invoiceData.gstApplicable || false,
            gstPercent: invoiceData.gstApplicable && invoiceData.cgstRate ? 
                        (invoiceData.cgstRate * 2) : (businessSettings?.defaultCgstRate + businessSettings?.defaultSgstRate) || 18,
            transportChargesApplicable: !!(invoiceData.transportCharges && invoiceData.transportCharges > 0),
            transportChargesLabel: invoiceData.transportChargesLabel || 'Transport Charges',
            transportCharges: invoiceData.transportCharges,
            items: resolvedItems
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setErrors({ general: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  // Run initial validation after form data is loaded
  useEffect(() => {
    if (!loading && formData.items.length > 0) {
      // Validate all fields initially
      validateField('customerName', formData.customerName);
      validateField('customerPhone', formData.customerPhone);
      validateField('invoiceDate', formData.invoiceDate);
      validateField('dueDate', formData.dueDate);
      
      // Validate all item fields initially
      formData.items.forEach((item, index) => {
        validateItemField(index, 'productName', item.productName);
        validateItemField(index, 'productId', item.productId);
        validateItemField(index, 'quantity', item.quantity);
        validateItemField(index, 'unitPrice', item.unitPrice);
      });
    }
  }, [loading, formData.items.length]);

  // Note: Product resolution is now handled in the main loadData function
  // to ensure products are loaded before invoice data processing

  // Debug logging for form data changes
  useEffect(() => {
    if (isEditing && formData.items.length > 0) {
      console.log('Form data updated:', formData);
      console.log('Items with product info:', formData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        isCustomProduct: item.isCustomProduct
      })));
      
      // Log available products for each item
      formData.items.forEach((item, index) => {
        const availableProducts = getAvailableProducts(index);
        console.log(`Available products for item ${index}:`, availableProducts);
        console.log(`Item ${index} should have productId:`, item.productId);
        console.log(`Available products with matching ID:`, availableProducts.filter(p => p.id.toString() === item.productId?.toString()));
      });
    }
  }, [formData.items, isEditing]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate field immediately after change
    validateField(field, value);
  };

  // Handle line item changes
  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    
    // Mark item field as touched
    const touchKey = `item_${index}_${field}`;
    setTouched(prev => ({
      ...prev,
      [touchKey]: true
    }));
    
    // Validate item field immediately after change
    validateItemField(index, field, value);
  };

  // Handle product selection
  const handleProductSelect = (index, productId) => {
    // Get available products including deleted ones
    const availableProducts = getAvailableProducts(index);
    const selectedProduct = availableProducts.find(p => p.id.toString() === productId.toString());
    
    if (selectedProduct) {
      if (selectedProduct.isDeleted) {
        // Handle deleted product selection
        // Keep the virtual ID so the dropdown shows the correct selection
        handleItemChange(index, 'productId', productId);
        handleItemChange(index, 'productName', selectedProduct.name);
        handleItemChange(index, 'unitPrice', selectedProduct.price || 1);
        // Keep as custom product since it's deleted
        handleItemChange(index, 'isCustomProduct', true);
      } else {
        // Handle active product selection
        handleItemChange(index, 'productId', productId);
        handleItemChange(index, 'productName', selectedProduct.name);
        // Uncheck custom product when a real product is selected
        handleItemChange(index, 'isCustomProduct', false);
      }
    }
  };

  // Check if a product name is already used in the current invoice (for validation)
  const isProductNameUsed = (productName, currentIndex) => {
    return formData.items.some((item, index) => 
      index !== currentIndex && 
      item.productName === productName
    );
  };

  // Helper function to determine if an item should be marked as custom
  const shouldBeCustomProduct = (item) => {
    // If it's already marked as custom, keep it
    if (item.isCustomProduct) return true;
    
    // If it has no productId but has a name, it might be custom
    if (!item.productId && item.productName && item.productName.trim() !== '') return true;
    
    // If it has a virtual deleted product ID, it's not custom initially
    if (item.productId && item.productId.toString().startsWith('deleted_')) return false;
    
    // If it has a real product ID, it's not custom
    if (item.productId && !item.productId.toString().startsWith('deleted_')) return false;
    
    return false;
  };

  // Get available products for a specific item (including deleted products from current invoice)
  const getAvailableProducts = (currentIndex) => {
    // In edit mode, we need to include deleted products that are already in the invoice
    if (isEditing) {
      console.log(`Getting available products for item ${currentIndex} in edit mode`);
      console.log('Current products:', products);
      console.log('Current form items:', formData.items);
      
      // Get all products (active + deleted ones from current invoice)
      const allAvailableProducts = [...products];
      
      // Add deleted products from current invoice that aren't in the active products list
      // We need to add ALL deleted products, not just the ones that aren't the current index
      formData.items.forEach((item, index) => {
        if (item.productName && item.productName.trim() !== '') {
          // Check if this product name exists in active products
          const existsInActive = products.some(p => p.name === item.productName);
          
          if (!existsInActive) {
            // This is a deleted product, add it as a virtual product
            // Use the same virtual ID format as created during loading
            const virtualProduct = {
              id: `deleted_${item.productName}`, // Virtual ID for deleted products
              name: item.productName,
              price: item.unitPrice,
              isDeleted: true // Flag to identify deleted products
            };
            
            // Only add if not already in the list
            if (!allAvailableProducts.some(p => p.name === item.productName)) {
              allAvailableProducts.push(virtualProduct);
              console.log('Added deleted product to available list:', virtualProduct);
            } else {
              console.log('Deleted product already exists in list:', item.productName);
            }
          } else {
            console.log('Product exists in active list:', item.productName);
          }
        }
      });
      
      console.log('Final available products:', allAvailableProducts);
      
      // In edit mode, allow all products to be selected (including duplicates)
      // This allows users to recreate the original invoice structure
      return allAvailableProducts;
    } else {
      // In create mode, use the original logic (prevent duplicates)
      return products.filter(product => {
        // Check if this product is already selected in another item
        return !formData.items.some((item, index) => 
          index !== currentIndex && 
          item.productId && 
          item.productId.toString() === product.id.toString() && 
          !item.isCustomProduct
        );
      });
    }
  };

  // Add new line item
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 1,
        isCustomProduct: false
      }]
    }));
  };

  // Remove line item
  const removeLineItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate line totals (no tax at line level)
  const calculateLineTotal = (item) => {
    return item.quantity * item.unitPrice;
  };

  // Calculate invoice totals with overall GST - matches backend calculation exactly
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    
    let cgst = 0;
    let sgst = 0;
    let totalGst = 0;
    
    if (formData.gstApplicable && formData.gstPercent > 0) {
      // Calculate CGST and SGST separately to match backend logic
      const cgstRate = formData.gstPercent / 2;
      const sgstRate = formData.gstPercent / 2;
      
      // Use same rounding as backend (2 decimal places, HALF_UP)
      cgst = Math.round((subtotal * cgstRate / 100) * 100) / 100;
      sgst = Math.round((subtotal * sgstRate / 100) * 100) / 100;
      totalGst = cgst + sgst;
    }
    
    // Add transport charges if applicable
    const transportCharges = formData.transportChargesApplicable ? 
      parseFloat(formData.transportCharges) : 0;
    
    const total = subtotal + totalGst + transportCharges;
    
    return { subtotal, cgst, sgst, totalGst, transportCharges, total };
  };

  // Validate a single field
  const validateField = (field, value) => {
    let error = null;
    
    switch (field) {
      case 'customerName':
        if (!value.trim()) {
          error = 'Customer name is required';
        }
        break;
      case 'customerEmail':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'customerPhone':
        if (!value.trim()) {
          error = 'Customer phone is required';
        }
        break;
      case 'invoiceDate':
        if (!value) {
          error = 'Invoice date is required';
        }
        break;
      case 'dueDate':
        if (!value) {
          error = 'Due date is required';
        }
        break;
      case 'gstPercent':
        if (formData.gstApplicable && (!value || value < 0)) {
          error = 'GST percent must be greater than or equal to 0';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validate a single item field
  const validateItemField = (index, field, value) => {
    let error = null;
    
    switch (field) {
      case 'productName':
        if (formData.items[index].isCustomProduct && !value.trim()) {
          error = 'Product name is required';
        }
        break;
      case 'productId':
        // Only validate productId if it's NOT a custom product
        if (!formData.items[index].isCustomProduct && !value) {
          error = 'Please select a product or mark as custom';
        }
        break;
      case 'quantity':
        if (!value || value <= 0) {
          error = 'Quantity must be greater than 0';
        }
        break;
      case 'unitPrice':
        if (!value || value <= 0) {
          error = 'Unit price must be greater than 0';
        }
        break;
    }
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [`item_${index}_${field === 'productName' ? 'name' : field === 'productId' ? 'product' : field === 'unitPrice' ? 'price' : field}`]: error
      }));
    } else {
      // Clear error if validation passes
      const errorKey = `item_${index}_${field === 'productName' ? 'name' : field === 'productId' ? 'product' : field === 'unitPrice' ? 'price' : field}`;
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Customer validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    }

    // Invoice dates validation
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    // GST validation
    if (formData.gstApplicable && (!formData.gstPercent || formData.gstPercent < 0)) {
      newErrors.gstPercent = 'GST percent must be greater than or equal to 0';
    }

    // Line items validation
    formData.items.forEach((item, index) => {
      if (item.isCustomProduct) {
        // For custom products, only validate productName
        if (!item.productName.trim()) {
          newErrors[`item_${index}_name`] = 'Product name is required';
        }
      } else {
        // For regular products, validate productId
        if (!item.productId) {
          newErrors[`item_${index}_product`] = 'Please select a product or mark as custom';
        }
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_price`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const invoiceData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerGstNumber: formData.customerGstNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        status: formData.status,
        notes: formData.notes,
        gstApplicable: formData.gstApplicable,
        cgstRate: formData.gstApplicable ? parseFloat(formData.gstPercent) / 2 : null,
        sgstRate: formData.gstApplicable ? parseFloat(formData.gstPercent) / 2 : null,
        transportChargesLabel: formData.transportChargesApplicable ? formData.transportChargesLabel : null,
        transportCharges: formData.transportChargesApplicable ? parseFloat(formData.transportCharges) : null,
        items: formData.items.map(item => ({
          productId: item.isCustomProduct ? null : (item.productId ? parseInt(item.productId) : null),
          productName: item.productName,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          isCustomProduct: item.isCustomProduct
        }))
      };

      let result;
      if (isEditing) {
        result = await invoiceAPI.update(id, invoiceData);
      } else {
        result = await invoiceAPI.create(invoiceData);
      }

      navigate(`/invoices/${result.id}`);
    } catch (error) {
      console.error('Error saving invoice:', error);
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/invoices">
            <Button variant="secondary">
              <ArrowLeftIcon />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update invoice details' : 'Fill in the details to create a new invoice'}
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button 
            variant="secondary" 
            onClick={() => {
              const now = new Date();
              setFormData(prev => ({
                ...prev,
                invoiceDate: formatDateForInput(now),
                dueDate: formatDateForInput(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
              }));
            }}
            className="ml-auto"
          >
            Refresh Date
          </Button>
        )}
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Details Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
                                      error={errors.customerName}
              placeholder="Enter customer name"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                      error={errors.customerEmail}
              placeholder="customer@example.com (optional)"
            />
            <Input
              label="Phone Number *"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              error={errors.customerPhone}
              placeholder="+1-555-0123"
            />
            <Input
              label="Address"
              value={formData.customerAddress}
              onChange={(e) => handleInputChange('customerAddress', e.target.value)}
              placeholder="Customer address"
            />
            <Input
              label="GST Number (Optional)"
              value={formData.customerGstNumber}
              onChange={(e) => handleInputChange('customerGstNumber', e.target.value)}
              placeholder="Customer GST number (if applicable)"
            />
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Invoice Date *"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              error={errors.invoiceDate}
            />
            <Input
              label="Due Date *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              error={errors.dueDate}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>

        {/* GST Settings Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GST Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="gstApplicable"
                checked={formData.gstApplicable}
                onChange={(e) => handleInputChange('gstApplicable', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="gstApplicable" className="text-sm font-medium text-gray-700">
                Apply GST to this invoice
              </label>
            </div>
            {formData.gstApplicable && (
              <Input
                label="GST Percentage *"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.gstPercent}
                onChange={(e) => handleInputChange('gstPercent', e.target.value)}
                onWheel={(e) => e.target.blur()}
                error={errors.gstPercent}
                placeholder="18.00"
              />
            )}
            {formData.gstApplicable && (
              <div className="text-sm text-gray-600">
                <p>GST will be split equally:</p>
                <p>• CGST: {(formData.gstPercent / 2).toFixed(2)}%</p>
                <p>• SGST: {(formData.gstPercent / 2).toFixed(2)}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Transport Charges Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Charges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="transportChargesApplicable"
                checked={formData.transportChargesApplicable}
                onChange={(e) => handleInputChange('transportChargesApplicable', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="transportChargesApplicable" className="text-sm font-medium text-gray-700">
                Apply Transport Charges
              </label>
            </div>
            
            {formData.transportChargesApplicable && (
              <>
                <Input
                  label="Transport Charges Label"
                  value={formData.transportChargesLabel}
                  onChange={(e) => handleInputChange('transportChargesLabel', e.target.value)}
                  placeholder="Transport Charges"
                />
                <Input
                  label="Transport Charges Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.transportCharges}
                  onChange={(e) => handleInputChange('transportCharges', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  placeholder="0.00"
                />
              </>
            )}
          </div>
        </div>

        {/* Line Items Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Line Items</h2>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                {/* Item Number */}
                <div className="absolute -left-2 -top-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Custom Product Checkbox */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 mb-2 ml-8">
                      <input
                        type="checkbox"
                        id={`customProduct_${index}`}
                        checked={item.isCustomProduct}
                        onChange={(e) => {
                          handleItemChange(index, 'isCustomProduct', e.target.checked);
                          if (e.target.checked) {
                            handleItemChange(index, 'productId', '');
                            // Clear productId error when switching to custom
                            setErrors(prev => ({
                              ...prev,
                              [`item_${index}_product`]: null
                            }));
                          } else {
                            // Clear productName error when switching away from custom
                            setErrors(prev => ({
                              ...prev,
                              [`item_${index}_name`]: null
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`customProduct_${index}`} className="text-sm font-medium text-gray-700">
                        Custom Product
                      </label>
                    </div>
                    
                    {!item.isCustomProduct ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                        >
                          <option value="">Select a product</option>
                          {getAvailableProducts(index).map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}{product.isDeleted ? ' (Deleted)' : ''}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <Input
                        label="Product Name *"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        error={errors[`item_${index}_name`]}
                        placeholder="Enter custom product name"
                      />
                    )}
                    {errors[`item_${index}_product`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <Input
                      label="Quantity *"
                      type="number"
                      min="1"
                      value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      error={errors[`item_${index}_quantity`]}
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <Input
                      label="Unit Price *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      error={errors[`item_${index}_price`]}
                    />
                  </div>

                  {/* Line Total & Actions */}
                  <div className="md:col-span-2 flex items-end justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Total
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(calculateLineTotal(item))}
                      </p>
                      {item.isCustomProduct && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          Custom{item.productId && item.productId.toString().startsWith('deleted_') ? ' (Deleted)' : ''}
                        </span>
                      )}
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        variant="danger"
                        size="sm"
                      >
                        <TrashIcon />
                      </Button>
                    )}
                  </div>
                </div>


                
                {/* Add horizontal line below each item */}
                <hr className="my-6 border-gray-300" />
              </div>
            ))}
            
            {/* Add Item Button - positioned below the last item */}
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={addLineItem} variant="primary" className="px-6 py-3">
                <PlusIcon />
                <span className="ml-2">Add Item</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Totals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
          <div className="space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            {formData.gstApplicable && totals.totalGst > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST ({(formData.gstPercent / 2).toFixed(2)}%):</span>
                  <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST ({(formData.gstPercent / 2).toFixed(2)}%):</span>
                  <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total GST:</span>
                  <span className="font-medium">{formatCurrency(totals.totalGst)}</span>
                </div>
              </>
            )}
            {formData.transportChargesApplicable && totals.transportCharges > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{formData.transportChargesLabel}:</span>
                <span className="font-medium">{formatCurrency(totals.transportCharges)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link to="/invoices">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={submitting}>
            {isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
