"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const Order_1 = require("../models/Order");
// GET /api/orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order_1.Order.find().populate("userId", "firstName lastName email");
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
exports.getOrders = getOrders;
// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id).populate("userId", "firstName lastName email");
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.getOrderById = getOrderById;
// POST /api/orders
const createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, status } = req.body;
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ error: "userId, items, and totalAmount are required" });
        }
        const order = await Order_1.Order.create({
            userId,
            items,
            totalAmount,
            status: status || "pending",
        });
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.createOrder = createOrder;
// PUT /api/orders/:id
const updateOrder = async (req, res) => {
    try {
        const { items, totalAmount, status } = req.body;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (items)
            order.items = items;
        if (totalAmount)
            order.totalAmount = totalAmount;
        if (status)
            order.status = status;
        await order.save();
        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.updateOrder = updateOrder;
// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
    try {
        const order = await Order_1.Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.deleteOrder = deleteOrder;
