"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users CRUD]
 *     summary: Get all users
 *     description: Retrieve list of all users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/", usersController_1.getUsers);
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users CRUD]
 *     summary: Get user by ID
 *     description: Retrieve specific user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved
 *       404:
 *         description: User not found
 */
router.get("/:id", usersController_1.getUserById);
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users CRUD]
 *     summary: Create new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, admin]
 *                 example: customer
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 */
router.post("/", usersController_1.createUser);
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users CRUD]
 *     summary: Update user
 *     description: Update user information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, vendor, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id", usersController_1.updateUser);
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users CRUD]
 *     summary: Delete user
 *     description: Delete user from system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", usersController_1.deleteUser);
exports.default = router;
