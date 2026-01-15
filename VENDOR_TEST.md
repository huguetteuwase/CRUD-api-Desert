# Vendor Role Testing Guide

## Quick Setup & Test

### Step 1: Create Admin and Category
```bash
# 1. Register admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin@example.com","password":"admin123"}'

# 2. Update to admin in MongoDB
# db.users.updateOne({email:"admin@example.com"},{$set:{role:"admin"}})

# 3. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
# Save the token as ADMIN_TOKEN

# 4. Create category
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic items"}'
# Save the category ID as CATEGORY_ID
```

### Step 2: Create Vendor 1
```bash
# 1. Register vendor 1
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alice","lastName":"Vendor","email":"alice@vendor.com","password":"vendor123"}'

# 2. Update to vendor in MongoDB
# db.users.updateOne({email:"alice@vendor.com"},{$set:{role:"vendor"}})

# 3. Login as vendor 1
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@vendor.com","password":"vendor123"}'
# Save the token as VENDOR1_TOKEN
```

### Step 3: Vendor 1 Creates Product
```bash
# Create product (automatically assigned to vendor 1)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer VENDOR1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"categoryId":"CATEGORY_ID","inStock":true,"quantity":10}'
# Save the product ID as PRODUCT1_ID

# Response will include createdBy field with vendor 1's user ID
```

### Step 4: Create Vendor 2
```bash
# 1. Register vendor 2
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Bob","lastName":"Vendor","email":"bob@vendor.com","password":"vendor123"}'

# 2. Update to vendor in MongoDB
# db.users.updateOne({email:"bob@vendor.com"},{$set:{role:"vendor"}})

# 3. Login as vendor 2
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@vendor.com","password":"vendor123"}'
# Save the token as VENDOR2_TOKEN
```

### Step 5: Vendor 2 Creates Own Product
```bash
# Create product (automatically assigned to vendor 2)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer VENDOR2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse","price":29.99,"categoryId":"CATEGORY_ID","inStock":true,"quantity":50}'
# Save the product ID as PRODUCT2_ID
```

### Step 6: Test Ownership - Vendor 1 Updates Own Product ✅
```bash
# Vendor 1 updates their laptop (SUCCESS)
curl -X PUT http://localhost:3000/api/products/PRODUCT1_ID \
  -H "Authorization: Bearer VENDOR1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":899.99,"quantity":15}'

# Expected: 200 OK
```

### Step 7: Test Ownership - Vendor 2 Tries to Update Vendor 1's Product ❌
```bash
# Vendor 2 tries to update vendor 1's laptop (FAIL)
curl -X PUT http://localhost:3000/api/products/PRODUCT1_ID \
  -H "Authorization: Bearer VENDOR2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":799.99}'

# Expected: 403 Forbidden
# Response: {"error": "Access denied. You can only update your own products."}
```

### Step 8: Test Ownership - Vendor 2 Updates Own Product ✅
```bash
# Vendor 2 updates their mouse (SUCCESS)
curl -X PUT http://localhost:3000/api/products/PRODUCT2_ID \
  -H "Authorization: Bearer VENDOR2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":24.99}'

# Expected: 200 OK
```

### Step 9: Test Admin Override - Admin Updates Any Product ✅
```bash
# Admin updates vendor 1's laptop (SUCCESS)
curl -X PUT http://localhost:3000/api/products/PRODUCT1_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":949.99}'

# Expected: 200 OK (Admin can update any product)
```

### Step 10: Test Vendor Restrictions - Vendor Tries to Create Category ❌
```bash
# Vendor 1 tries to create category (FAIL)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer VENDOR1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Books","description":"All books"}'

# Expected: 403 Forbidden
# Response: {"error": "Access denied. Insufficient permissions."}
```

### Step 11: Test Delete Ownership - Vendor 1 Deletes Own Product ✅
```bash
# Vendor 1 deletes their laptop (SUCCESS)
curl -X DELETE http://localhost:3000/api/products/PRODUCT1_ID \
  -H "Authorization: Bearer VENDOR1_TOKEN"

# Expected: 204 No Content
```

### Step 12: Test Delete Ownership - Vendor 2 Tries to Delete Vendor 1's Product ❌
```bash
# First, vendor 1 creates another product
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer VENDOR1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","price":79.99,"categoryId":"CATEGORY_ID","inStock":true,"quantity":20}'
# Save as PRODUCT3_ID

# Vendor 2 tries to delete vendor 1's keyboard (FAIL)
curl -X DELETE http://localhost:3000/api/products/PRODUCT3_ID \
  -H "Authorization: Bearer VENDOR2_TOKEN"

# Expected: 403 Forbidden
# Response: {"error": "Access denied. You can only delete your own products."}
```

---

## Test Results Summary

| Test | Vendor | Action | Expected | Result |
|------|--------|--------|----------|--------|
| 1 | Vendor 1 | Create product | ✅ Success | Product created with createdBy |
| 2 | Vendor 2 | Create product | ✅ Success | Product created with createdBy |
| 3 | Vendor 1 | Update own product | ✅ Success | Product updated |
| 4 | Vendor 2 | Update vendor 1's product | ❌ 403 Forbidden | Access denied |
| 5 | Vendor 2 | Update own product | ✅ Success | Product updated |
| 6 | Admin | Update any product | ✅ Success | Product updated |
| 7 | Vendor 1 | Create category | ❌ 403 Forbidden | Access denied |
| 8 | Vendor 1 | Delete own product | ✅ Success | Product deleted |
| 9 | Vendor 2 | Delete vendor 1's product | ❌ 403 Forbidden | Access denied |

---

## MongoDB Queries for Setup

```javascript
// Connect to MongoDB
use crud_db

// Promote user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)

// Promote user to vendor
db.users.updateOne(
  { email: "alice@vendor.com" },
  { $set: { role: "vendor" } }
)

db.users.updateOne(
  { email: "bob@vendor.com" },
  { $set: { role: "vendor" } }
)

// Check user roles
db.users.find({}, { firstName: 1, email: 1, role: 1 })

// Check products with ownership
db.products.find({}, { name: 1, price: 1, createdBy: 1 })

// Find products by specific vendor
db.products.find({ createdBy: ObjectId("vendor-user-id") })
```

---

## Key Takeaways

✅ **Automatic Ownership:** Products are automatically assigned to the creating vendor

✅ **Ownership Validation:** Vendors can only modify their own products

✅ **Admin Override:** Admins can manage all products regardless of ownership

✅ **Role Restrictions:** Vendors cannot manage categories or users

✅ **Security:** Server-side validation prevents unauthorized access

---

## Troubleshooting

### Issue: 403 Forbidden when vendor creates product
**Solution:** Ensure user role is set to "vendor" in database

### Issue: Vendor can update other vendor's products
**Solution:** Check that ownership validation is working in controller

### Issue: createdBy field is null
**Solution:** Ensure authentication middleware is running before product creation

### Issue: Admin cannot update products
**Solution:** Verify admin role is set correctly and authorize middleware includes "admin"
