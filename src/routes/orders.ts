import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order from cart
 *     description: Place an order from current cart items (customer only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Cart is empty or product out of stock
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user's orders
 *     description: Retrieve all orders for logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     description: Retrieve single order (own order only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get("/:id", authenticate, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel order
 *     description: Cancel pending order (own order only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Cannot cancel non-pending order
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.patch("/:id/cancel", authenticate, cancelOrder);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags: [Admin Orders]
 *     summary: Get all orders (Admin only)
 *     description: Retrieve all orders from all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders retrieved
 *       403:
 *         description: Insufficient permissions
 */
router.get("/admin", authenticate, authorize(["admin"]), getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: Update order status (Admin only)
 *     description: Update order status to confirmed, shipped, delivered, or cancelled
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.patch("/admin/:id/status", authenticate, authorize(["admin"]), updateOrderStatus);

export default router;
