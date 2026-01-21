"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productModel_1 = __importDefault(require("../models/productModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const mapProduct = (doc) => ({
    id: String(doc._id),
    name: doc.name,
    price: doc.price,
    description: doc.description,
    categoryId: String(doc.categoryId),
    inStock: doc.inStock,
    quantity: doc.quantity,
    createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
});
const getAllProducts = async (req, res) => {
    try {
        const docs = await productModel_1.default.find().lean();
        res.json(docs.map(mapProduct));
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await productModel_1.default.findById(id).lean();
        if (!doc)
            return res.status(404).json({ message: "Product not found" });
        res.json(mapProduct(doc));
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    const { name, price, description, categoryId, inStock, quantity } = req.body;
    if (!name ||
        price === undefined ||
        !categoryId ||
        inStock === undefined ||
        quantity === undefined) {
        return res.status(400).json({ message: "Missing required product fields" });
    }
    try {
        // Check if product with same name already exists
        const existingProduct = await productModel_1.default.findOne({ name: name.trim() });
        if (existingProduct) {
            return res.status(409).json({
                message: "Product with this name already exists",
                existingProduct: mapProduct(existingProduct)
            });
        }
        // Resolve category: prefer Mongo _id when valid, else fallback to legacyId
        let cat = null;
        if (mongoose_1.default.isValidObjectId(categoryId)) {
            cat = await categoryModel_1.default.findById(categoryId).lean();
        }
        if (!cat) {
            cat = await categoryModel_1.default.findOne({ legacyId: categoryId }).lean();
        }
        if (!cat)
            return res.status(400).json({ message: "categoryId does not exist" });
        const created = await productModel_1.default.create({
            name: name.trim(),
            price,
            description,
            categoryId: cat._id,
            inStock,
            quantity,
            createdBy: req.user._id,
        });
        res.status(201).json(mapProduct(created));
    }
    catch (err) {
        res
            .status(400)
            .json({ message: "Invalid categoryId or request", error: err });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, categoryId, inStock, quantity } = req.body;
    try {
        const product = await productModel_1.default.findById(id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        // Check ownership: vendors can only update their own products
        if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
            return res.status(403).json({ error: "Access denied. You can only update your own products." });
        }
        let resolvedCategoryId = categoryId;
        if (categoryId) {
            let cat = null;
            if (mongoose_1.default.isValidObjectId(categoryId)) {
                cat = await categoryModel_1.default.findById(categoryId).lean();
            }
            if (!cat)
                cat = await categoryModel_1.default.findOne({ legacyId: categoryId }).lean();
            if (!cat)
                return res.status(400).json({ message: "categoryId does not exist" });
            resolvedCategoryId = cat._id;
        }
        const updated = await productModel_1.default.findByIdAndUpdate(id, {
            name,
            price,
            description,
            categoryId: resolvedCategoryId,
            inStock,
            quantity,
        }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ message: "Product not found" });
        res.json(mapProduct(updated));
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel_1.default.findById(id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        // Check ownership: vendors can only delete their own products
        if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
            return res.status(403).json({ error: "Access denied. You can only delete your own products." });
        }
        await productModel_1.default.findByIdAndDelete(id);
        res.status(204).send();
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.deleteProduct = deleteProduct;
