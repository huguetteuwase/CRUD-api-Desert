import { Request, Response } from "express";
import mongoose from "mongoose";
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";

interface AuthRequest extends Request {
  user?: any;
}

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  try {
    const cart = await CartModel.findOne({ userId }).populate(
      "items.productId"
    );
    if (!cart) {
      return res.json({ userId, items: [], itemCount: 0 });
    }
    const items = cart.items.map((item: any) => ({
      id: item._id,
      productId: item.productId?._id || item.productId,
      name: item.productId?.name,
      price: item.productId?.price,
      quantity: item.quantity,
    }));
    
    // Calculate total item count (sum of all quantities)
    const itemCount = cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
    
    res.json({ userId: cart.userId, items, itemCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err });
  }
};

export const addItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body as {
    productId: string;
    quantity: number;
  };
  if (!productId || !quantity)
    return res.status(400).json({ message: "productId and quantity required" });
  if (!mongoose.isValidObjectId(productId))
    return res.status(400).json({ message: "Invalid productId" });

  try {
    const product = await ProductModel.findById(productId);
    if (!product) return res.status(400).json({ message: "Product not found" });

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = await CartModel.create({ userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find((item: any) => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      // Product exists, increase quantity
      existingItem.quantity += quantity;
      await cart.save();
      res.status(200).json({
        id: existingItem._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: existingItem.quantity,
        message: "Product quantity updated"
      });
    } else {
      // Product doesn't exist, add new item
      cart.items.push({ productId: product._id, quantity } as any);
      await cart.save();
      const addedItem = cart.items[cart.items.length - 1] as any;
      res.status(201).json({
        id: addedItem._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: addedItem.quantity,
        message: "Product added to cart"
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err });
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid item id" });
  const { quantity } = req.body as { quantity: number };

  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (quantity !== undefined) item.quantity = quantity;
    await cart.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item", error: err });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid item id" });

  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.id(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    cart.items.pull(id);
    await cart.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  try {
    await CartModel.findOneAndDelete({ userId });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err });
  }
};

// GET /api/cart/count - Get cart item count
export const getCartItemCount = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  try {
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.json({ itemCount: 0 });
    }
    
    // Calculate total item count (sum of all quantities)
    const itemCount = cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
    
    res.json({ itemCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to get cart count", error: err });
  }
};
