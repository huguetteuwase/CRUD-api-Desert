import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DESERT CRUD API with Authentication",
      version: "1.0.0",
      description:
        "Complete REST API with JWT authentication, role-based access control, and shopping cart functionality",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://crud-api-desert.onrender.com/",
        description: "production   server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6967f6dbf174b4e5d6dee051" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: { type: "string", example: "john@example.com" },
            role: {
              type: "string",
              enum: ["customer", "vendor", "admin"],
              example: "customer",
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6967f6dbf174b4e5d6dee052" },
            name: { type: "string", example: "Electronics" },
            description: { type: "string", example: "Electronic items" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "6967f6dbf174b4e5d6dee053" },
            name: { type: "string", example: "Laptop" },
            price: { type: "number", example: 999.99 },
            description: { type: "string", example: "High-performance laptop" },
            categoryId: { type: "string", example: "6967f6dbf174b4e5d6dee052" },
            inStock: { type: "boolean", example: true },
            quantity: { type: "number", example: 10 },
            createdBy: { type: "string", example: "6967f6dbf174b4e5d6dee051" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            userId: { type: "string", example: "6967f6dbf174b4e5d6dee051" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  productId: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
            message: { type: "string", example: "Detailed error message" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object" },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and account management",
      },
      { name: "Users", description: "User management (Admin only)" },
      { name: "Categories", description: "Product categories management" },
      { name: "Products", description: "Product management" },
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Orders", description: "Order management for customers" },
      { name: "Admin Orders", description: "Order management for admins" },
      { name: "Users CRUD", description: "Simple users CRUD operations" },
      { name: "Orders CRUD", description: "Simple orders CRUD operations" },
      { name: "File Upload", description: "File upload and management" },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
