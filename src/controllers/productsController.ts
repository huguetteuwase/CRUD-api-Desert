import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../models/productModel";
import CategoryModel from "../models/categoryModel";

interface AuthRequest extends Request {
  user?: any;
}

const mapProduct = (doc: any) => ({
  id: String(doc._id),
  name: doc.name,
  price: doc.price,
  description: doc.description,
  categoryId: String(doc.categoryId),
  inStock: doc.inStock,
  quantity: doc.quantity,
  createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
});

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const docs = await ProductModel.find().lean();
    res.json(docs.map(mapProduct));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const doc = await ProductModel.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Product not found" });
    res.json(mapProduct(doc));
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, price, description, categoryId, inStock, quantity } = req.body;
  if (
    !name ||
    price === undefined ||
    !categoryId ||
    inStock === undefined ||
    quantity === undefined
  ) {
    return res.status(400).json({ message: "Missing required product fields" });
  }
  try {
    // Check if product with same name already exists
    const existingProduct = await ProductModel.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(409).json({ 
        message: "Product with this name already exists",
        existingProduct: mapProduct(existingProduct)
      });
    }

    // Resolve category: prefer Mongo _id when valid, else fallback to legacyId
    let cat = null as any;
    if (mongoose.isValidObjectId(categoryId)) {
      cat = await CategoryModel.findById(categoryId).lean();
    }
    if (!cat) {
      cat = await CategoryModel.findOne({ legacyId: categoryId }).lean();
    }
    if (!cat)
      return res.status(400).json({ message: "categoryId does not exist" });
    
    const created = await ProductModel.create({
      name: name.trim(),
      price,
      description,
      categoryId: cat._id,
      inStock,
      quantity,
      createdBy: req.user._id,
    });
    res.status(201).json(mapProduct(created));
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid categoryId or request", error: err });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, price, description, categoryId, inStock, quantity } = req.body;
  try {
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check ownership: vendors can only update their own products
    if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied. You can only update your own products." });
    }

    let resolvedCategoryId = categoryId;
    if (categoryId) {
      let cat = null as any;
      if (mongoose.isValidObjectId(categoryId)) {
        cat = await CategoryModel.findById(categoryId).lean();
      }
      if (!cat)
        cat = await CategoryModel.findOne({ legacyId: categoryId }).lean();
      if (!cat)
        return res.status(400).json({ message: "categoryId does not exist" });
      resolvedCategoryId = cat._id;
    }
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        categoryId: resolvedCategoryId,
        inStock,
        quantity,
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(mapProduct(updated));
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check ownership: vendors can only delete their own products
    if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied. You can only delete your own products." });
    }

    await ProductModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};
