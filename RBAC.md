# Role-Based Access Control (RBAC) Documentation

## User Roles

### 1. **User** (Default Role)
Regular user with limited permissions

**Permissions:**
- ✅ View all categories (public)
- ✅ View all products (public)
- ✅ Manage own cart (add, update, remove items)
- ✅ View own profile
- ✅ Change own password
- ❌ Cannot create/update/delete categories
- ❌ Cannot create/update/delete products
- ❌ Cannot manage other users

### 2. **Vendor**
Seller who manages their own products

**Permissions:**
- ✅ All user permissions
- ✅ Create products (auto-assigned as owner)
- ✅ Update own products only
- ✅ Delete own products only
- ❌ Cannot update/delete other vendors' products
- ❌ Cannot manage categories
- ❌ Cannot manage users

### 3. **Admin**
System administrator with full access

**Permissions:**
- ✅ All user and vendor permissions
- ✅ Create, update, delete categories
- ✅ Create, update, delete any product
- ✅ View all users
- ✅ Update any user (role, status)
- ✅ Delete any user
- ✅ Access all protected resources

---

## API Endpoints by Role

### **Public Endpoints** (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/categories` | View all categories |
| GET | `/api/categories/:id` | View single category |
| GET | `/api/products` | View all products |
| GET | `/api/products/:id` | View single product |

### **User Role Endpoints** (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get own profile |
| POST | `/api/auth/logout` | Logout |
| PUT | `/api/auth/change-password` | Change own password |
| GET | `/api/cart` | Get own cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:id` | Update cart item |
| DELETE | `/api/cart/items/:id` | Remove cart item |
| DELETE | `/api/cart` | Clear cart |

### **Admin Role Endpoints** (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update any product |
| DELETE | `/api/products/:id` | Delete any product |
| GET | `/api/auth/users` | Get all users |
| GET | `/api/auth/users/:id` | Get user by ID |
| PUT | `/api/auth/users/:id` | Update user |
| DELETE | `/api/auth/users/:id` | Delete user |

### **Vendor Role Endpoints** (Vendor Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product (auto-assigned) |
| PUT | `/api/products/:id` | Update own product |
| DELETE | `/api/products/:id` | Delete own product |

---

## Creating an Admin User

### Method 1: Register and Manually Update in Database
```bash
# 1. Register as normal user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin@example.com","password":"admin123"}'

# 2. Update role in MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Modify Registration Controller (Temporary)
Add role field to registration for first admin:
```typescript
// In authController.ts - register function (temporary)
const user = await User.create({
  firstName,
  lastName,
  email,
  password,
  role: "admin" // Add this temporarily
});
```

---

## Testing RBAC

### Test as Regular User
```bash
# 1. Register/Login as user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. Try to create category (should fail with 403)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Books","description":"All books"}'

# Expected Response: 403 Forbidden
{
  "error": "Access denied. Insufficient permissions."
}
```

### Test as Admin
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Create category (should succeed)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Books","description":"All books"}'

# Expected Response: 201 Created
{
  "_id": "...",
  "name": "Books",
  "description": "All books"
}
```

---

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "error": "Access denied. No token provided."
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

---

## RBAC Implementation Details

### Middleware Chain
```typescript
// Public route
router.get("/categories", getAllCategories);

// Authenticated route (any logged-in user)
router.get("/cart", authenticate, getCart);

// Admin-only route
router.post("/categories", authenticate, authorize(["admin"]), createCategory);
```

### Authorization Middleware
```typescript
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
```

---

## Security Best Practices

✅ **Token-Based Authentication:** JWT tokens with 7-day expiry

✅ **Role Validation:** Server-side role checking (never trust client)

✅ **Password Security:** Bcrypt hashing with 12 salt rounds

✅ **User Isolation:** Users can only access their own resources

✅ **Admin Separation:** Admin operations require explicit role check

✅ **Public Access:** Read-only operations available without authentication

---

## Quick Reference

| Action | User | Vendor | Admin |
|--------|------|--------|-------|
| View categories/products | ✅ | ✅ | ✅ |
| Manage own cart | ✅ | ✅ | ✅ |
| Create products | ❌ | ✅ | ✅ |
| Update own products | ❌ | ✅ | ✅ |
| Update any product | ❌ | ❌ | ✅ |
| Delete own products | ❌ | ✅ | ✅ |
| Delete any product | ❌ | ❌ | ✅ |
| Create/Edit/Delete categories | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |

---

## Complete Test Workflow

```bash
# 1. Create admin user (first time setup)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin@example.com","password":"admin123"}'

# 2. Update to admin role in MongoDB
# db.users.updateOne({email:"admin@example.com"},{$set:{role:"admin"}})

# 3. Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 4. Create category (admin only)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic items"}'

# 5. Create product (admin only)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"categoryId":"<category-id>","inStock":true,"quantity":10}'

# 6. Register regular user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# 7. Login as user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 8. View products (public)
curl -X GET http://localhost:3000/api/products

# 9. Add to cart (user)
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","quantity":1}'

# 10. Try to create category as user (should fail)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Books","description":"All books"}'
# Expected: 403 Forbidden
```
