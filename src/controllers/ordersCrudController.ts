import { Request, Response } from "express";
import { Order } from "../models/Order";

// GET /api/orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate("userId", "firstName lastName email");
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "firstName lastName email");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, totalAmount, status } = req.body;

    if (!userId || !items || !totalAmount) {
      return res.status(400).json({ error: "userId, items, and totalAmount are required" });
    }

    const order = await Order.create({
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
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// PUT /api/orders/:id
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (items) order.items = items;
    if (totalAmount) order.totalAmount = totalAmount;
    if (status) order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};