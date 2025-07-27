import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Table from '../components/ui/Table';
import { invoiceAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusColor, calculateInvoiceTotals } from '../utils/helpers';

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

const PrintIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

// Modern PDF invoice HTML/CSS
function generateBillHtml(invoice, items, customer) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Cash Bill</title>
  <style>
    body {
      margin: 0;
      background: #f6f8fb !important;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #233244;
    }
    .a4-sheet {
      background: #e2e8f0;
      min-height: 98vh;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bill-card {
      width: 95%;
      max-width: 630px;
      margin: 36px auto 18px auto;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(51,56,88,0.13);
      background: #fff;
      border: 0.5px solid #e0e7ef;
      position: relative;
    }
    .bill-header {
      background: linear-gradient(90deg, #2647b9 77%, #334bb2 95%, #ffa726 100%);
      color: #fff;
      padding: 35px 16px 13px 16px;
      text-align: center;
    }
    .bill-header h1 {
      margin: 0; font-size: 2.2rem; font-weight: bold;
      letter-spacing: 1.5px; color: #FFD700; text-shadow: 1px 2px 3px #234;
    }
    .bill-header .address {
      margin-bottom: 6px;
      font-size: 13px;
      color: #eaeaea;
      letter-spacing: .4px;
      font-weight:400;
      text-shadow: 0 0 2px #234;
    }
    .bill-header .type {
      font-weight: bold;
      font-size: 1.07rem;
      margin: 4px 0 0 0;
      color: #ffe6c2;
      letter-spacing: 2.4px;
      text-shadow: 0 0 2px #334bb2;
    }
    .bill-metadata {
      width: 94%;
      margin: 17px auto 10px auto;
      font-size: 10.8pt;
      color: #314155;
      background: #f7f8fa;
      border-radius: 7px;
      box-shadow: 0 1px 4px #e8eafc;
      padding: 13px 10px 10px 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 2.5px;
      column-gap: 8px;
    }
    .bill-metadata label { font-weight:500; margin-right:2px; color: #364870;}
    .bill-metadata .meta-block span {display: block;}
    .bill-metadata .label-block { margin:0 0 1.7px 0; }
    .bill-metadata .value-block { color: #0e172a;}

    .bill-table {
      width: 94%;
      margin:18px auto 8px auto;
      border-collapse: collapse;
      font-size: 10.0pt;
      background: #fff;
      border-radius:8px 8px 0 0;
      overflow:hidden;
      box-shadow:0 2px 6px #d6e0fb44;
    }
    .bill-table th, .bill-table td {
      border: 1.3px solid #c1c3d7;
      padding: 6px 9px;
      text-align: center;
    }
    .bill-table th {
      background: #ebf1fd;
      font-size: 11pt;
      font-weight: 800;
      color: #28314e;
      border-bottom: 2.6px solid #d1d6e8;
    }
    .bill-table td {
      font-size: 10.1pt;
      color: #1b2338;
      background: #fff;
    }
    .bill-table .row-total {
      font-weight: bold;
      background: linear-gradient(90deg, #eaf1fc 70%, #fafafa 100%);
      color: #174093;
    }
    .footer-taxes {
      width:92%;
      margin:19px auto 0 auto;
      font-size: 10.4pt;
      color: #314155;
      background: #f7f7fc;
      padding: 7.5px 15px;
      border-radius: 7px;
      display:flex;
      gap:34px;
      justify-content: flex-start;
      letter-spacing:0.13em;
      font-weight: 500;
    }
    .accounts-section {
      margin:14px auto 10px auto;
      width:91%;
      padding: 9px 0 5px 0;
      background: #fafdff;
      border-radius: 6px;
    }
    .account-row {
      font-size:10pt;
      color:#344157;
      margin-bottom:2px;
      display:grid;
      grid-template-columns: 68px 175px 83px 128px 45px 128px 39px 104px;
      gap:2px 8px;
      align-items:top;
      padding-left: 8px;
    }
    .account-row span[title] { font-weight: bold;}
    .sign-area {
      width: 93%;
      margin: 18px auto 2px auto;
      text-align: right;
      font-size: 12.5pt;
      font-weight: bold;
      color: #ffa726;
      letter-spacing:1.2px;
      background: linear-gradient(90deg,rgba(135,191,255, 0.02) 50%, #2647b9 110%);
      padding:10px 14px 4px 0;
      border-radius: 0 0 12px 12px;
      text-shadow: 0px 1px 4px #234;
    }
    .bill-footer {
      width: 100%;
      background: linear-gradient(90deg, #212744 65%, #2a3174 100%);
      color: #fff6da;
      padding: 16px 12px 17px 12px;
      text-align: center;
      font-size: 10.8pt;
      font-weight: 500;
      letter-spacing: .03em;
      border-radius: 0 0 22px 22px;
      margin-top: 24px;
    }
    .bill-footer .footer-main { color: #ffda91; font-weight: bold;}
    @media print {
      .a4-sheet { box-shadow: none; }
      body { background: #fff !important; }
      .bill-main { box-shadow:none;}
    }
  </style>
</head>
<body>
  <div class="a4-sheet">
    <div class="bill-card" id="bill-pdf-root">
      <div class="bill-header">
        <h1>G.R. TAILORS</h1>
        <div class="address">No.39, Bazar Street, Karunguzhi - 603303.<br>Madurantakam- Tk, Chengalpattu Dt.</div>
        <div class="type">CASH BILL</div>
      </div>
      <div class="bill-metadata">
        <div class="meta-block">
          <span class="label-block"><label>To:</label></span>
          <span class="value-block">${customer?.name || ''}</span>
        </div>
        <div class="meta-block">
          <span class="label-block"><label>Invoice No:</label></span>
          <span class="value-block">${invoice.invoiceNumber || ''}</span>
        </div>
        <div class="meta-block">
          <span class="label-block"><label>GST No:</label></span>
          <span class="value-block">33AFEPA0388J1ZQ</span>
        </div>
        <div class="meta-block">
          <span class="label-block"><label>Date:</label></span>
          <span class="value-block">${invoice.invoiceDate || ''}</span>
        </div>
        <div class="meta-block" style="grid-column: span 2;">
          <span class="label-block"><label>Address:</label></span>
          <span class="value-block">${customer?.address || ''}</span>
        </div>
      </div>
      <table class="bill-table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>PARTICULARS</th>
            <th>QTY</th>
            <th>Rate Rs.</th>
            <th>Tax %</th>
            <th>Amount Rs.</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.product?.name || ''}</td>
              <td>${item.quantity}</td>
              <td>${item.unitPrice}</td>
              <td>${item.taxPercent ?? ''}</td>
              <td>${item.total}</td>
            </tr>
          `).join('')}
          <tr class="row-total">
            <td colspan="5" style="text-align:right;">Total</td>
            <td style="text-align:center;">${invoice.totalAmount}</td>
          </tr>
        </tbody>
      </table>
     
    
      <div class="sign-area">For G.R. TAILORS</div>
      <div class="bill-footer">
        <div>T. Mohankumar </div>
        SBI A/C: 114206016172 IFSC: SBIN0003128 | Corp A/C: 52010125784372 IFSC: UBIN0913081 <br>
        Issued by: G.R. TAILORS &nbsp;|&nbsp; Thank you for your business!
      </div>
    </div>
  </div>
</body>
</html>
  `;
}



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
      const data = await invoiceAPI.getById(id);
      setInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    const html = generateBillHtml(invoice, invoice.invoiceItems || [], invoice.customer);
    const iframe = document.createElement('iframe');
    iframe.style.width = '500px';
    iframe.style.height = '700px';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    await new Promise(res => {
      iframe.onload = () => setTimeout(res, 300);
      setTimeout(res, 700);
    });
    const billDiv = iframe.contentWindow.document.getElementById('bill-pdf-root');
    if (billDiv) {
      await html2canvas(billDiv, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 570;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pdfWidth, pdfHeight] });
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      }).catch(() => alert('Failed to generate PDF.'));
    } else {
      alert('Failed to render bill for PDF.');
    }
    document.body.removeChild(iframe);
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

  const totals = calculateInvoiceTotals(invoice.invoiceItems || []);

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
          <Button variant="outline" onClick={handlePrint}>
            <PrintIcon />
            <span className="ml-2">Print</span>
          </Button>
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
                <p className="font-medium">{invoice.customer?.name}</p>
                <p>{invoice.customer?.email}</p>
                <p>{invoice.customer?.phone}</p>
                <p className="whitespace-pre-line">{invoice.customer?.address}</p>
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
                  <Table.Head>Description</Table.Head>
                  <Table.Head>Qty</Table.Head>
                  <Table.Head>Unit Price</Table.Head>
                  <Table.Head>Tax %</Table.Head>
                  <Table.Head>Total</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoice.invoiceItems?.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="font-medium">
                      {item.product?.name}
                    </Table.Cell>
                    <Table.Cell className="max-w-xs">
                      {item.product?.description}
                    </Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell>{formatCurrency(item.unitPrice)}</Table.Cell>
                    <Table.Cell>{item.taxPercent}%</Table.Cell>
                    <Table.Cell className="font-medium">
                      {formatCurrency(item.total)}
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
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                </div>
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
