#!/bin/bash

echo "Fixing BillMaster Frontend Dependencies..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

echo "Installing react-router-dom..."
npm install react-router-dom

if [ $? -ne 0 ]; then
    echo
    echo "Error installing react-router-dom. Please check your npm installation."
    echo
    echo "Alternative solutions:"
    echo "1. Try: yarn add react-router-dom"
    echo "2. Or use the simple version without routing"
    echo
    exit 1
fi

echo
echo "Dependencies installed successfully!"
echo
echo "The application should now work properly."
echo "To start the development server, run: npm run dev"
echo
