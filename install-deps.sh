#!/bin/bash

# Install missing dependencies for BillMaster Frontend
echo "Installing required dependencies for BillMaster Frontend..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install React Router DOM (required)
echo "Installing react-router-dom..."
npm install react-router-dom

# Install optional but recommended packages
echo "Installing optional packages (axios for better HTTP handling, lucide-react for icons)..."
npm install axios lucide-react

echo "All dependencies installed successfully!"
echo ""
echo "To start the development server, run:"
echo "npm run dev"
echo ""
echo "The application will be available at http://localhost:5173"
