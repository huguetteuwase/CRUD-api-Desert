# Authentication API Documentation

## Base URL
`http://localhost:3000/api/auth`

---

## Public Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Forgot Password
**POST** `/api/auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "abc123..."
}
```

### 4. Reset Password
**POST** `/api/auth/reset-password/:resetToken`

**Body:**
```json
{
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Protected Endpoints (Require Authentication)

**Header Required:**
```
Authorization: Bearer <your-token>
```

### 5. Get Profile
**GET** `/api/auth/me`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### 6. Logout
**POST** `/api/auth/logout`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 7. Change Password
**PUT** `/api/auth/change-password`

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Admin Only Endpoints (Require Admin Role)

**Header Required:**
```
Authorization: Bearer <admin-token>
```

### 8. Get All Users
**GET** `/api/auth/users`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    }
  ]
}
```

### 9. Get User by ID
**GET** `/api/auth/users/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

### 10. Update User
**PUT** `/api/auth/users/:id`

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "admin",
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

### 11. Delete User
**DELETE** `/api/auth/users/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

### Change Password
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password123","newPassword":"newPassword456"}'
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password/<resetToken> \
  -H "Content-Type: application/json" \
  -d '{"password":"newPassword123"}'
```

### Get All Users (Admin)
```bash
curl -X GET http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer <admin-token>"
```

### Update User (Admin)
```bash
curl -X PUT http://localhost:3000/api/auth/users/<userId> \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","isActive":true}'
```

### Delete User (Admin)
```bash
curl -X DELETE http://localhost:3000/api/auth/users/<userId> \
  -H "Authorization: Bearer <admin-token>"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
} 
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists with this email"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "..."
}
```

---

## Notes

- JWT tokens expire after 7 days
- Password reset tokens expire after 10 minutes
- Passwords are hashed with bcrypt (12 salt rounds)
- Default role is "user"
- Admin role required for user management endpoints
- Logout is client-side (remove token from storage)
