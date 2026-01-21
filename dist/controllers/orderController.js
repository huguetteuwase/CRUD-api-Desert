"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.cancelOrder = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const cartModel_1 = __importDefault(require("../models/cartModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
// POST /api/orders - Create order from cart
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        // Get user's cart
        const cart = await cartModel_1.default.findOne({ userId: userId.toString() });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        // Fetch product details and calculate total
        const orderItems = [];
        let totalAmount = 0;
        for (const item of cart.items) {
            const product = await productModel_1.default.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            if (!product.inStock || product.quantity < item.quantity) {
                return res.status(400).json({
                    error: `Product ${product.name} is out of stock or insufficient quantity`
                });
            }
            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
            totalAmount += product.price * item.quantity;
            // Update product quantity
            product.quantity -= item.quantity;
            if (product.quantity === 0) {
                product.inStock = false;
            }
            await product.save();
        }
        // Create order
        const order = await Order_1.Order.create({
            userId,
            items: orderItems,
            totalAmount,
            status: "pending",
        });
        // Clear cart
        cart.items.splice(0, cart.items.length);
        await cart.save();
        // Send order confirmation email
        const user = await User_1.User.findById(userId);
        if (user) {
            emailService_1.emailService.sendOrderPlacedEmail(user.email, user.firstName, order._id.toString(), totalAmount);
        }
        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.createOrder = createOrder;
// GET /api/orders - Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order_1.Order.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getUserOrders = getUserOrders;
// GET /api/orders/:id - Get single order
const getOrderById = async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Check ownership
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Access denied" });
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getOrderById = getOrderById;
// PATCH /api/orders/:id/cancel - Cancel order
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Check ownership
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Access denied" });
        }
        // Only pending orders can be cancelled
        if (order.status !== "pending") {
            return res.status(400).json({
                error: `Cannot cancel order with status: ${order.status}`
            });
        }
        order.status = "cancelled";
        await order.save();
        // Restore product quantities
        for (const item of order.items) {
            const product = await productModel_1.default.findById(item.productId);
            if (product) {
                product.quantity += item.quantity;
                product.inStock = true;
                await product.save();
            }
        }
        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.cancelOrder = cancelOrder;
// GET /api/admin/orders - Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order_1.Order.find()
            .populate("userId", "firstName lastName email")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
// PATCH /api/admin/orders/:id/status - Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status. Must be: pending, confirmed, shipped, delivered, or cancelled"
            });
        }
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        order.status = status;
        await order.save();
        // Send order status update email
        const user = await User_1.User.findById(order.userId);
        if (user) {
            emailService_1.emailService.sendOrderStatusEmail(user.email, user.firstName, order._id.toString(), status);
        }
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
