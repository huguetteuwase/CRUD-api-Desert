"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItemCount = exports.clearCart = exports.deleteItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cartModel_1 = __importDefault(require("../models/cartModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const getCart = async (req, res) => {
    const userId = req.user._id;
    try {
        const cart = await cartModel_1.default.findOne({ userId }).populate("items.productId");
        if (!cart) {
            return res.json({ userId, items: [], itemCount: 0 });
        }
        const items = cart.items.map((item) => ({
            id: item._id,
            productId: item.productId?._id || item.productId,
            name: item.productId?.name,
            price: item.productId?.price,
            quantity: item.quantity,
        }));
        // Calculate total item count (sum of all quantities)
        const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        res.json({ userId: cart.userId, items, itemCount });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch cart", error: err });
    }
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity)
        return res.status(400).json({ message: "productId and quantity required" });
    if (!mongoose_1.default.isValidObjectId(productId))
        return res.status(400).json({ message: "Invalid productId" });
    try {
        const product = await productModel_1.default.findById(productId);
        if (!product)
            return res.status(400).json({ message: "Product not found" });
        let cart = await cartModel_1.default.findOne({ userId });
        if (!cart) {
            cart = await cartModel_1.default.create({ userId, items: [] });
        }
        // Check if product already exists in cart
        const existingItem = cart.items.find((item) => item.productId.toString() === productId);
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
        }
        else {
            // Product doesn't exist, add new item
            cart.items.push({ productId: product._id, quantity });
            await cart.save();
            const addedItem = cart.items[cart.items.length - 1];
            res.status(201).json({
                id: addedItem._id,
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: addedItem.quantity,
                message: "Product added to cart"
            });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Failed to add item", error: err });
    }
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ message: "Invalid item id" });
    const { quantity } = req.body;
    try {
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        const item = cart.items.id(id);
        if (!item)
            return res.status(404).json({ message: "Item not found" });
        if (quantity !== undefined)
            item.quantity = quantity;
        await cart.save();
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to update item", error: err });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ message: "Invalid item id" });
    try {
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        const item = cart.items.id(id);
        if (!item)
            return res.status(404).json({ message: "Item not found" });
        cart.items.pull(id);
        await cart.save();
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ message: "Failed to delete item", error: err });
    }
};
exports.deleteItem = deleteItem;
const clearCart = async (req, res) => {
    const userId = req.user._id;
    try {
        await cartModel_1.default.findOneAndDelete({ userId });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ message: "Failed to clear cart", error: err });
    }
};
exports.clearCart = clearCart;
// GET /api/cart/count - Get cart item count
const getCartItemCount = async (req, res) => {
    const userId = req.user._id;
    try {
        const cart = await cartModel_1.default.findOne({ userId });
        if (!cart) {
            return res.json({ itemCount: 0 });
        }
        // Calculate total item count (sum of all quantities)
        const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        res.json({ itemCount });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to get cart count", error: err });
    }
};
exports.getCartItemCount = getCartItemCount;
