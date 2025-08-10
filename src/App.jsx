import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import BusinessSettings from './pages/BusinessSettings';

function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-fadeIn">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
              <Route path="/settings" element={<BusinessSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
