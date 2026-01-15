import { Request, Response } from "express";
import CategoryModel from "../models/categoryModel";

const mapCategory = (doc: any) => ({
  id: String(doc._id),
  name: doc.name,
  description: doc.description,
});

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const docs = await CategoryModel.find().lean();
    res.json(docs.map(mapCategory));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const doc = await CategoryModel.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Category not found" });
    res.json(mapCategory(doc));
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  try {
    const created = await CategoryModel.create({ name, description });
    res.status(201).json(mapCategory(created));
  } catch (err) {
    res.status(500).json({ message: "Failed to create category", error: err });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const updated = await CategoryModel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    ).lean();
    if (!updated)
      return res.status(404).json({ message: "Category not found" });
    res.json(mapCategory(updated));
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await CategoryModel.findByIdAndDelete(id).lean();
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Invalid id or request", error: err });
  }
};
