import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Table from '../components/ui/Table';

// Icon components
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);



const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoice with ID:', id);
      const data = await invoiceAPI.getById(id);
      console.log('Received invoice data:', data);
      console.log('GST Data from API:', {
        gstApplicable: data.gstApplicable,
        cgstRate: data.cgstRate,
        sgstRate: data.sgstRate,
        cgstAmount: data.cgstAmount,
        sgstAmount: data.sgstAmount,
        totalGstAmount: data.totalGstAmount
      });
      setInvoice(data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleDownloadPdf = async () => {
    if (!invoice) return;
    
    try {
      // Use the backend PDF endpoint that includes owner data
      const pdfBlob = await invoiceAPI.downloadPdf(invoice.id);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
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
            <h3 className="font-medium">Error loading invoice</h3>
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

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invoice not found</p>
        <Link to="/invoices" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeftIcon />
            <span className="ml-2">Back to Invoices</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Link to="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              Invoice #{invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <span className="ml-2">Download as PDF</span>
          </Button>
          <Link to={`/invoices/${invoice.id}/edit`}>
            <Button>
              <EditIcon />
              <span className="ml-2">Edit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900">BillMaster</span>
              </div>
              <p className="text-gray-600">Professional Billing System</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p className="text-lg font-semibold text-gray-700">#{invoice.invoiceNumber}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)} mt-2`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                <p>{invoice.customerPhone}</p>
                {invoice.customerAddress && <p className="whitespace-pre-line">{invoice.customerAddress}</p>}
                {invoice.customerGstNumber && (
                  <p className="text-sm">
                    <span className="font-medium">GST Number:</span> {invoice.customerGstNumber}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Invoice Date:</span>
                  <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Product</Table.Head>
                  <Table.Head>Qty</Table.Head>
                  <Table.Head>Unit Price</Table.Head>
                  <Table.Head>Line Total</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoice.lineItems?.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{item.productName}</span>
                        {item.isCustomProduct && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Custom
                          </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell>{formatCurrency(item.unitPrice)}</Table.Cell>
                    <Table.Cell className="font-medium">
                      {formatCurrency(item.lineTotal)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotalAmount)}</span>
                </div>
                
                {/* Transport Charges */}
                {/*{invoice.transportCharges && invoice.transportCharges > 0 && (
                  <div className="flex justify-between">
                    <span>{invoice.transportChargesLabel || 'Transport Charges'}:</span>
                    <span className="font-medium">{formatCurrency(invoice.transportCharges)}</span>
                  </div>
                )}
                
                {/* Miscellaneous Charges */}
                {/*{invoice.miscCharges && invoice.miscCharges > 0 && (
                  <div className="flex justify-between">
                    <span>{invoice.miscChargesLabel || 'Miscellaneous Charges'}:</span>
                    <span className="font-medium">{formatCurrency(invoice.miscCharges)}</span>
                  </div>
                )}
                
                {/* Debug: Always show GST info */}
                
                
                {/* GST Breakdown - Always show if gstApplicable is true */}
                {invoice.gstApplicable && (
                  <>
                    <div className="flex justify-between">
                      <span>CGST ({invoice.cgstRate?.toFixed(1) || '9.0'}%):</span>
                      <span className="font-medium">{formatCurrency(invoice.cgstAmount || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>SGST ({invoice.sgstRate?.toFixed(1) || '9.0'}%):</span>
                      <span className="font-medium">{formatCurrency(invoice.sgstAmount || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total GST:</span>
                      <span className="font-medium">{formatCurrency(invoice.totalGstAmount || 0)}</span>
                    </div>
                  </>
                )}
                
                {/* Transport Charges - Only show if greater than 0 */}
                {invoice.transportCharges != null && invoice.transportCharges > 0 && (
                  <div className="flex justify-between">
                    <span>{invoice.transportChargesLabel || 'Transport Charges'}:</span>
                    <span className="font-medium">{formatCurrency(invoice.transportCharges)}</span>
                  </div>
                )}
                
                {/* Show message if GST not applicable */}
                {!invoice.gstApplicable && (
                  <div className="text-sm text-gray-500 italic">
                    GST not applicable for this invoice
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
              <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
