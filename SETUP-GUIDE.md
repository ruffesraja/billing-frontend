# BillMaster Frontend - Complete Setup & Troubleshooting Guide

## 🚀 Quick Start

### 1. Prerequisites Check
```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Verify you're in the correct directory
pwd
# Should show: .../billing-frontEnd/my-billing-app
```

### 2. Install Dependencies
```bash
# Navigate to the correct directory
cd "F:\rahul pro v1\billing-frontEnd\my-billing-app"

# Install all dependencies
npm install

# Start the development server
npm run dev
```

### 3. Verify Backend Connection
- Ensure your Spring Boot backend is running on `http://localhost:8080`
- Open the frontend at `http://localhost:5173`
- Check the Dashboard for connection status

## 🔧 Common Issues & Solutions

### Issue 1: "Failed to resolve import react-router-dom"
**Solution:**
```bash
cd "F:\rahul pro v1\billing-frontEnd\my-billing-app"
npm install react-router-dom
```

### Issue 2: "npm error Missing script: dev"
**Problem:** You're in the wrong directory
**Solution:**
```bash
# Make sure you're in the my-billing-app folder
cd "F:\rahul pro v1\billing-frontEnd\my-billing-app"
ls package.json  # This should exist
npm run dev
```

### Issue 3: Cannot Add Customers/Products
**Possible Causes:**
1. Backend not running
2. CORS issues
3. API endpoint problems
4. Form validation errors

**Solutions:**
1. **Check Backend:**
   ```bash
   # Test if backend is running
   curl http://localhost:8080/api/customers
   # Or open in browser: http://localhost:8080/api/customers
   ```

2. **Check Frontend Console:**
   - Open browser Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

3. **Use Built-in Diagnostics:**
   - Go to Dashboard
   - Click "Show Diagnostics"
   - Run the diagnostic tests

### Issue 4: CORS Errors
**Error:** `Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Backend Solution (Spring Boot):**
Add this to your Spring Boot application:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Issue 5: Form Submission Not Working
**Debug Steps:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try to submit a form
4. Look for error messages

**Common Form Issues:**
- **Validation Errors:** Check if all required fields are filled
- **Network Errors:** Check if backend is accessible
- **Data Format Issues:** Check console for API request/response

## 🧪 Testing Your Setup

### 1. Backend Connection Test
```bash
# Test customers endpoint
curl -X GET http://localhost:8080/api/customers

# Test products endpoint
curl -X GET http://localhost:8080/api/products

# Test invoices endpoint
curl -X GET http://localhost:8080/api/invoices
```

### 2. Frontend Functionality Test
1. **Dashboard:** Should load without errors
2. **Customers:** 
   - List should load (even if empty)
   - "Add Customer" button should open modal
   - Form should validate required fields
3. **Products:**
   - List should load (even if empty)
   - "Add Product" button should open modal
   - Form should validate price and tax fields
4. **Invoices:**
   - List should load (even if empty)
   - "Create Invoice" should navigate to form

### 3. Create Test Data
**Test Customer:**
```json
{
  "name": "Test Customer",
  "email": "test@example.com",
  "phone": "1234567890",
  "address": "123 Test Street, Test City, TC 12345"
}
```

**Test Product:**
```json
{
  "name": "Test Product",
  "description": "This is a test product",
  "unitPrice": 99.99,
  "taxPercent": 8.25
}
```

## 🔍 Debugging Tools

### 1. Built-in Diagnostics
- Go to Dashboard
- Click "Show Diagnostics"
- Run comprehensive system tests

### 2. Browser Developer Tools
```
F12 → Console Tab → Look for errors
F12 → Network Tab → Check API requests
F12 → Application Tab → Check local storage
```

### 3. Backend Logs
Check your Spring Boot console for:
- API request logs
- Error messages
- Database connection issues

## 📋 Verification Checklist

### ✅ Environment Setup
- [ ] Node.js 16+ installed
- [ ] npm working correctly
- [ ] In correct directory (`my-billing-app`)
- [ ] Dependencies installed (`npm install`)

### ✅ Backend Connection
- [ ] Spring Boot running on port 8080
- [ ] API endpoints accessible
- [ ] CORS properly configured
- [ ] Database connected

### ✅ Frontend Functionality
- [ ] Development server starts (`npm run dev`)
- [ ] Dashboard loads without errors
- [ ] Navigation works
- [ ] Forms open and validate
- [ ] API calls succeed

### ✅ Data Operations
- [ ] Can view customers/products/invoices
- [ ] Can create new customers
- [ ] Can create new products
- [ ] Can create new invoices
- [ ] Can edit existing records
- [ ] Can delete records

## 🆘 Getting Help

### 1. Check Console Logs
Always check browser console (F12) for detailed error messages.

### 2. Common Error Messages

**"Network Error"**
- Backend not running
- Wrong port (should be 8080)
- Firewall blocking connection

**"CORS Error"**
- Backend CORS not configured
- Wrong origin in CORS settings

**"Validation Error"**
- Required fields missing
- Invalid email/phone format
- Invalid number format

**"404 Not Found"**
- Wrong API endpoint
- Backend route not configured

### 3. Step-by-Step Debugging

1. **Test Backend Directly:**
   ```bash
   curl http://localhost:8080/api/customers
   ```

2. **Check Frontend Console:**
   - Open F12 → Console
   - Look for red error messages

3. **Check Network Requests:**
   - Open F12 → Network
   - Try the action that's failing
   - Look for failed requests (red)

4. **Use Diagnostics Panel:**
   - Dashboard → Show Diagnostics
   - Run all tests
   - Check results

## 📞 Support Information

If you're still having issues:

1. **Collect Information:**
   - Error messages from console
   - Network request details
   - Backend logs
   - System information

2. **Common Solutions:**
   - Restart both frontend and backend
   - Clear browser cache
   - Check firewall settings
   - Verify database connection

3. **Last Resort:**
   ```bash
   # Clean reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

**Remember:** Most issues are related to:
1. Wrong directory
2. Backend not running
3. CORS configuration
4. Missing dependencies

Follow this guide step by step, and your BillMaster application should work perfectly! 🎉
