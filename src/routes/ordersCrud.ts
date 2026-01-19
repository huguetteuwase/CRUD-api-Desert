import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/ordersCrudController";

const router = Router();

/**
 * @swagger
 * /api/orders-crud:
 *   get:
 *     tags: [Orders CRUD]
 *     summary: Get all orders
 *     description: Retrieve list of all orders
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get("/", getOrders);

/**
 * @swagger
 * /api/orders-crud/{id}:
 *   get:
 *     tags: [Orders CRUD]
 *     summary: Get order by ID
 *     description: Retrieve specific order by ID
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
 *       404:
 *         description: Order not found
 */
router.get("/:id", getOrderById);

/**
 * @swagger
 * /api/orders-crud:
 *   post:
 *     tags: [Orders CRUD]
 *     summary: Create new order
 *     description: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *               - totalAmount
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6967f6dbf174b4e5d6dee051
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *                 example: 99.99
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post("/", createOrder);

/**
 * @swagger
 * /api/orders-crud/{id}:
 *   put:
 *     tags: [Orders CRUD]
 *     summary: Update order
 *     description: Update order information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *               totalAmount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/:id", updateOrder);

/**
 * @swagger
 * /api/orders-crud/{id}:
 *   delete:
 *     tags: [Orders CRUD]
 *     summary: Delete order
 *     description: Delete order from system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete("/:id", deleteOrder);

export default router;