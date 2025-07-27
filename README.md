# BillMaster - Billing Management Frontend

A modern, responsive React frontend application for the BillMaster billing management system. This application provides a complete interface for managing customers, products, and invoices with a clean, professional design.

## 🚀 Features

### Dashboard
- Overview statistics (customers, products, invoices, revenue)
- Invoice status breakdown (paid, unpaid, overdue)
- Recent invoices list
- Quick navigation to all sections

### Customer Management
- View all customers in a responsive table
- Search customers by name, email, phone, or address
- Add new customers with form validation
- Edit existing customer information
- Delete customers with confirmation
- Responsive design for mobile and desktop

### Product Management
- Product catalog with pricing and tax information
- Search products by name or description
- Add new products with validation
- Edit product details including pricing and tax rates
- Delete products with confirmation
- Responsive table layout

### Invoice Management
- Complete invoice listing with filtering
- Filter by status (All, Paid, Unpaid, Overdue)
- Search invoices by number or customer
- Create new invoices with multiple line items
- Edit existing invoices
- View detailed invoice with printable format
- Delete invoices with confirmation
- Automatic tax and total calculations

## 🛠️ Technology Stack

- **React 19** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Custom CSS** - Tailwind-like utility classes
- **Responsive Design** - Mobile-first approach
- **Modern JavaScript** - ES6+ features

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn** package manager
3. **Backend API** running on `http://localhost:8080`

## 🚀 Installation & Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd billing-frontEnd/my-billing-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install additional required packages:**
   ```bash
   npm install react-router-dom
   # Note: axios and lucide-react are optional but recommended
   npm install axios lucide-react
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

## 🔧 Configuration

### API Configuration
The application is configured to connect to the backend API at `http://localhost:8080`. If your backend is running on a different port or host, update the `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-host:port/api';
```

### Environment Variables
You can create a `.env` file in the root directory to configure environment-specific settings:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

Key responsive features:
- Collapsible navigation menu on mobile
- Responsive tables with horizontal scrolling
- Adaptive form layouts
- Touch-friendly buttons and interactions

## 🎨 UI Components

### Reusable Components
- **Button** - Multiple variants (primary, secondary, success, danger, warning, outline)
- **Input** - Form input with validation and error states
- **Modal** - Flexible modal dialog with different sizes
- **Table** - Responsive table with consistent styling
- **LoadingSpinner** - Loading indicator with different sizes

### Pages
- **Dashboard** - Overview and statistics
- **Customers** - Customer management
- **Products** - Product catalog management
- **Invoices** - Invoice management and creation
- **InvoiceDetail** - Detailed invoice view with print functionality
- **InvoiceForm** - Create and edit invoices

## 🔍 Key Features

### Search & Filtering
- Real-time search with debouncing
- Multiple filter options
- Case-insensitive search across multiple fields

### Form Validation
- Client-side validation for all forms
- Real-time error feedback
- Required field indicators
- Email and phone number validation

### Invoice Management
- Dynamic line item addition/removal
- Automatic tax calculations
- Real-time total updates
- Print-friendly invoice layout

### Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages
- Loading states for better UX

## 🖨️ Print Functionality

The invoice detail page includes print functionality with:
- Clean, professional print layout
- Hidden navigation and action buttons
- Optimized typography for printing
- Company branding and invoice formatting

## 📊 Data Flow

1. **API Service Layer** (`src/services/api.js`) - Handles all backend communication
2. **Utility Functions** (`src/utils/helpers.js`) - Common formatting and validation functions
3. **Components** - Reusable UI components with consistent styling
4. **Pages** - Main application views with business logic

## 🔧 Development

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   ├── Navigation.jsx   # Main navigation
│   ├── CustomerForm.jsx # Customer form component
│   └── ProductForm.jsx  # Product form component
├── pages/               # Main application pages
│   ├── Dashboard.jsx    # Dashboard overview
│   ├── Customers.jsx    # Customer management
│   ├── Products.jsx     # Product management
│   ├── Invoices.jsx     # Invoice listing
│   ├── InvoiceDetail.jsx # Invoice detail view
│   └── InvoiceForm.jsx  # Invoice creation/editing
├── services/            # API service layer
│   └── api.js          # Backend API communication
├── utils/               # Utility functions
│   └── helpers.js      # Common helper functions
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles and utilities
```

### Adding New Features

1. **Create new components** in the `components/` directory
2. **Add new pages** in the `pages/` directory
3. **Update routing** in `App.jsx`
4. **Add API endpoints** in `services/api.js`
5. **Add utility functions** in `utils/helpers.js`

## 🚀 Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🤝 Backend Integration

This frontend is designed to work with the Spring Boot backend API. Make sure the backend is running and accessible before starting the frontend application.

### Required Backend Endpoints
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice

## 📝 License

This project is part of the BillMaster billing management system.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure backend is running on `http://localhost:8080`
   - Check CORS configuration in backend
   - Verify API endpoints are accessible

2. **Styling Issues**
   - Clear browser cache
   - Ensure all CSS classes are properly defined
   - Check for conflicting styles

3. **Routing Issues**
   - Ensure React Router DOM is properly installed
   - Check route definitions in `App.jsx`
   - Verify browser history is working

### Getting Help

If you encounter any issues:
1. Check the browser console for errors
2. Verify backend API is running and accessible
3. Ensure all dependencies are properly installed
4. Check network requests in browser developer tools

---

**BillMaster Frontend** - A modern, responsive billing management interface built with React.
