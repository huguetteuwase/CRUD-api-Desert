# Cart API Documentation

## Base URL
`http://localhost:3000/api/cart`

**All cart endpoints require authentication**

**Header Required:**
```
Authorization: Bearer <your-token>
```

---

## Cart Endpoints (All Protected)

### 1. Get Current User Cart
**GET** `/api/cart`

**Description:** Get the cart for the authenticated user (automatically linked to JWT userId)

**Response (200):**
```json
{
  "userId": "user-id-from-jwt",
  "items": [
    {
      "id": "item-id",
      "productId": "product-id",
      "name": "Product Name",
      "price": 9.99,
      "quantity": 2
    }
  ]
}
```

### 2. Add Product to Cart
**POST** `/api/cart/items`

**Body:**
```json
{
  "productId": "product-id",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "id": "item-id",
  "productId": "product-id",
  "name": "Product Name",
  "price": 9.99,
  "quantity": 2
}
```

### 3. Update Cart Item Quantity
**PUT** `/api/cart/items/:id`

**Body:**
```json
{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "_id": "item-id",
  "productId": "product-id",
  "quantity": 5
}
```

### 4. Remove Item from Cart
**DELETE** `/api/cart/items/:id`

**Response:** 204 No Content

### 5. Clear Entire Cart
**DELETE** `/api/cart`

**Response:** 204 No Content

---

## cURL Examples

### Get Cart
```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer <your-token>"
```

### Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","quantity":2}'
```

### Update Item Quantity
```bash
curl -X PUT http://localhost:3000/api/cart/items/<item-id> \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'
```

### Remove Item from Cart
```bash
curl -X DELETE http://localhost:3000/api/cart/items/<item-id> \
  -H "Authorization: Bearer <your-token>"
```

### Clear Cart
```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer <your-token>"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "productId and quantity required"
}
```

```json
{
  "message": "Invalid productId"
}
```

```json
{
  "message": "Product not found"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied. No token provided."
}
```

```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Cart not found"
}
```

```json
{
  "message": "Item not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch cart",
  "error": "..."
}
```

---

## Key Features

✅ **JWT-Based Authentication:** Cart is automatically linked to the authenticated user from JWT token

✅ **User Isolation:** Users can only access their own cart (no userId in URL needed)

✅ **Automatic Cart Creation:** Cart is created automatically when user adds first item

✅ **Product Population:** Cart items include product details (name, price)

---

## Migration Notes

**Old API (deprecated):**
- `GET /api/cart/:userId`
- `POST /api/cart/:userId/items`
- `PUT /api/cart/:userId/items/:id`
- `DELETE /api/cart/:userId/items/:id`
- `DELETE /api/cart/:userId`

**New API (current):**
- `GET /api/cart` (userId from JWT)
- `POST /api/cart/items` (userId from JWT)
- `PUT /api/cart/items/:id` (userId from JWT)
- `DELETE /api/cart/items/:id` (userId from JWT)
- `DELETE /api/cart` (userId from JWT)

**Benefits:**
- More secure (users can't access other users' carts)
- Cleaner API (no userId in URL)
- Better UX (automatic user detection from token)
