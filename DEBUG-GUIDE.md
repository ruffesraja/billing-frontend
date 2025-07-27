# 🐛 Debug Guide - Customer & Product CRUD Operations

## 🔍 Quick Debugging Steps

### 1. **Check Backend Connection**
```bash
# Test if backend is running
curl http://localhost:8080/api/customers
curl http://localhost:8080/api/products

# Expected: JSON array response (even if empty: [])
# Error: Connection refused = Backend not running
```

### 2. **Use Built-in Debug Tools**
1. Go to **Customers** or **Products** page
2. Click **"Debug"** button in the top-right
3. Use the **API Testing Panel** to test individual operations
4. Check results for success/error messages

### 3. **Browser Console Debugging**
```javascript
// Open browser console (F12 → Console)
// Look for these log messages:

// ✅ Success logs:
"Fetching customers..."
"Customers fetched successfully: [...]"
"Creating new customer"
"Customer created successfully: {...}"

// ❌ Error logs:
"Error fetching customers: [error message]"
"API request failed: [error details]"
```

## 🧪 Step-by-Step Testing

### **Test 1: Backend Connectivity**
```bash
# 1. Check if backend is running
curl -X GET http://localhost:8080/api/customers

# Expected responses:
# ✅ Success: [] or [{...customer data...}]
# ❌ Error: curl: (7) Failed to connect to localhost port 8080
```

### **Test 2: CORS Configuration**
```javascript
// In browser console, run:
fetch('http://localhost:8080/api/customers')
  .then(response => response.json())
  .then(data => console.log('CORS OK:', data))
  .catch(error => console.error('CORS Error:', error));

// ✅ Success: "CORS OK: [...]"
// ❌ Error: "CORS Error: ... blocked by CORS policy"
```

### **Test 3: Create Customer**
```javascript
// Test customer creation in browser console:
fetch('http://localhost:8080/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    address: '123 Test St'
  })
})
.then(response => response.json())
.then(data => console.log('Customer created:', data))
.catch(error => console.error('Creation failed:', error));
```

### **Test 4: Create Product**
```javascript
// Test product creation in browser console:
fetch('http://localhost:8080/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Product',
    description: 'Test Description',
    unitPrice: 99.99,
    taxPercent: 8.25
  })
})
.then(response => response.json())
.then(data => console.log('Product created:', data))
.catch(error => console.error('Creation failed:', error));
```

## 🔧 Common Issues & Solutions

### **Issue 1: "Unable to connect to the server"**
**Symptoms:**
- Red error message on dashboard
- API Testing Panel shows connection failures
- Console shows "Failed to fetch" errors

**Solutions:**
1. **Check Backend Status:**
   ```bash
   # Make sure Spring Boot is running
   cd /path/to/your/backend
   ./mvnw spring-boot:run
   ```

2. **Verify Port:**
   - Backend should be on `http://localhost:8080`
   - Frontend should be on `http://localhost:5173`

3. **Check Firewall:**
   - Disable firewall temporarily
   - Or allow ports 8080 and 5173

### **Issue 2: "CORS policy blocked"**
**Symptoms:**
- Console shows CORS errors
- API calls fail with CORS messages

**Backend Solution (Spring Boot):**
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

### **Issue 3: Form Validation Errors**
**Symptoms:**
- Form shows validation errors
- Red text under form fields
- Submit button doesn't work

**Debug Steps:**
1. **Check Required Fields:**
   - Name: Must not be empty
   - Email: Must be valid format
   - Phone: Must be 10-15 digits
   - Address: Must not be empty

2. **Check Console for Validation Logs:**
   ```javascript
   // Look for these messages:
   "Form validation failed: {...}"
   "Submitting cleaned data: {...}"
   ```

### **Issue 4: Delete Operations Not Working**
**Symptoms:**
- Delete button doesn't work
- No confirmation dialog
- Items don't get deleted

**Debug Steps:**
1. **Check Console for Delete Logs:**
   ```javascript
   "Deleting customer with ID: 123"
   "Customer deleted successfully"
   ```

2. **Test Delete API Directly:**
   ```bash
   # Replace 123 with actual ID
   curl -X DELETE http://localhost:8080/api/customers/123
   ```

### **Issue 5: Data Not Loading**
**Symptoms:**
- Empty tables
- "No customers/products found" message
- Loading spinner never stops

**Debug Steps:**
1. **Check API Response:**
   ```bash
   curl http://localhost:8080/api/customers
   # Should return JSON array
   ```

2. **Check Console Logs:**
   ```javascript
   "Fetching customers..."
   "Customers fetched successfully: [...]"
   ```

3. **Verify Database:**
   - Check if database is connected
   - Verify tables exist and have data

## 🛠️ Advanced Debugging

### **Network Tab Analysis**
1. Open **F12 → Network Tab**
2. Try the failing operation
3. Look for red (failed) requests
4. Click on failed request to see details:
   - **Status Code:** 404 = Not Found, 500 = Server Error
   - **Response:** Error message details
   - **Headers:** CORS issues

### **Backend Logs**
Check your Spring Boot console for:
```
# ✅ Success logs:
2024-07-10 20:00:00.000  INFO --- [nio-8080-exec-1] c.e.controller.CustomerController : Creating customer: {...}
2024-07-10 20:00:00.000  INFO --- [nio-8080-exec-1] c.e.controller.CustomerController : Customer created with ID: 123

# ❌ Error logs:
2024-07-10 20:00:00.000 ERROR --- [nio-8080-exec-1] c.e.controller.CustomerController : Error creating customer: {...}
2024-07-10 20:00:00.000 ERROR --- [nio-8080-exec-1] o.h.engine.jdbc.spi.SqlExceptionHelper : Database connection failed
```

### **Database Verification**
```sql
-- Check if tables exist and have data
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM invoices;

-- Check recent entries
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;
SELECT * FROM products ORDER BY created_at DESC LIMIT 5;
```

## 📋 Debugging Checklist

### ✅ **Environment Check**
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Database connected and accessible
- [ ] No firewall blocking ports

### ✅ **API Check**
- [ ] GET requests return data
- [ ] POST requests create records
- [ ] DELETE requests remove records
- [ ] CORS headers present in responses

### ✅ **Frontend Check**
- [ ] Console shows successful API calls
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states work correctly

### ✅ **Data Check**
- [ ] Database tables exist
- [ ] Sample data present (if expected)
- [ ] Foreign key constraints working
- [ ] Data types match API expectations

## 🆘 Emergency Fixes

### **Quick Reset**
```bash
# 1. Restart backend
cd /path/to/backend
./mvnw spring-boot:run

# 2. Restart frontend
cd /path/to/frontend/my-billing-app
npm run dev

# 3. Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

### **Test with Sample Data**
```bash
# Create test customer via curl
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug Customer",
    "email": "debug@test.com",
    "phone": "9999999999",
    "address": "Debug Address"
  }'

# Create test product via curl
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug Product",
    "description": "Debug Description",
    "unitPrice": 99.99,
    "taxPercent": 10.0
  }'
```

## 📞 Getting Help

If you're still having issues:

1. **Collect Debug Information:**
   - Browser console logs (F12 → Console)
   - Network request details (F12 → Network)
   - Backend console logs
   - API Testing Panel results

2. **Common Solutions:**
   - Restart both frontend and backend
   - Check database connection
   - Verify CORS configuration
   - Clear browser cache

3. **Use the Debug Panel:**
   - Go to Customers/Products page
   - Click "Debug" button
   - Run all API tests
   - Share the results

---

**Remember:** 90% of CRUD issues are caused by:
1. Backend not running (port 8080)
2. CORS not configured
3. Database connection issues
4. Wrong API endpoints

Follow this guide step by step, and your CRUD operations should work perfectly! 🎉
