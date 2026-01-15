"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsController_1 = require("../controllers/productsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     description: Retrieve list of all products (public access)
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", productsController_1.getAllProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve single product by ID (public access)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", productsController_1.getProductById);
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (Admin/Vendor)
 *     description: Create a new product. Vendors can create products that are auto-assigned to them.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - inStock
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               price:
 *                 type: number
 *                 example: 999.99
 *               description:
 *                 type: string
 *                 example: High-performance laptop
 *               categoryId:
 *                 type: string
 *                 example: 6967f6dbf174b4e5d6dee052
 *               inStock:
 *                 type: boolean
 *                 example: true
 *               quantity:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Insufficient permissions (Admin/Vendor only)
 */
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["admin", "vendor"]), productsController_1.createProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (Admin/Owner Vendor)
 *     description: Update product. Vendors can only update their own products. Admins can update any product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Laptop
 *               price:
 *                 type: number
 *                 example: 899.99
 *               description:
 *                 type: string
 *               inStock:
 *                 type: boolean
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Access denied (Vendors can only update own products)
 *       404:
 *         description: Product not found
 */
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin", "vendor"]), productsController_1.updateProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (Admin/Owner Vendor)
 *     description: Delete product. Vendors can only delete their own products. Admins can delete any product.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       403:
 *         description: Access denied (Vendors can only delete own products)
 *       404:
 *         description: Product not found
 */
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin", "vendor"]), productsController_1.deleteProduct);
exports.default = router;
