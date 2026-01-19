import { Response } from "express";
import { Order } from "../models/Order";
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";

interface AuthRequest extends Request {
  user?: any;
}

// POST /api/orders - Create order from cart
export const createOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // Get user's cart
    const cart = await CartModel.findOne({ userId: userId.toString() });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Fetch product details and calculate total
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId);
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
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    // Clear cart
    cart.items.splice(0, cart.items.length);
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /api/orders - Get user's orders
export const getUserOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /api/orders/:id - Get single order
export const getOrderById = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const order = await Order.findById(req.params.id);

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
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// PATCH /api/orders/:id/cancel - Cancel order
export const cancelOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const order = await Order.findById(req.params.id);

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
      const product = await ProductModel.findById(item.productId);
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
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// GET /api/admin/orders - Get all orders (Admin only)
export const getAllOrders = async (req: any, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// PATCH /api/admin/orders/:id/status - Update order status (Admin only)
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be: pending, confirmed, shipped, delivered, or cancelled" 
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
