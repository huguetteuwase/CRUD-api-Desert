"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user cart
 *     description: Get current user's shopping cart (automatically linked to JWT user)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth_1.authenticate, cartController_1.getCart);
/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add product to cart
 *     description: Add a product to the current user's cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 6967f6dbf174b4e5d6dee053
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Bad request (invalid productId or quantity)
 *       401:
 *         description: Unauthorized
 */
router.post("/items", auth_1.authenticate, cartController_1.addItem);
/**
 * @swagger
 * /api/cart/items/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     description: Update quantity of an item in the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized
 */
router.put("/items/:id", auth_1.authenticate, cartController_1.updateItem);
/**
 * @swagger
 * /api/cart/items/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       204:
 *         description: Item removed successfully
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/items/:id", auth_1.authenticate, cartController_1.deleteItem);
/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear cart
 *     description: Remove all items from the current user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/", auth_1.authenticate, cartController_1.clearCart);
exports.default = router;
