"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const mapCategory = (doc) => ({
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
});
const getAllCategories = async (req, res) => {
    try {
        const docs = await categoryModel_1.default.find().lean();
        res.json(docs.map(mapCategory));
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch categories", error: err });
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await categoryModel_1.default.findById(id).lean();
        if (!doc)
            return res.status(404).json({ message: "Category not found" });
        res.json(mapCategory(doc));
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name)
        return res.status(400).json({ message: "Name is required" });
    try {
        const created = await categoryModel_1.default.create({ name, description });
        res.status(201).json(mapCategory(created));
    }
    catch (err) {
        res.status(500).json({ message: "Failed to create category", error: err });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updated = await categoryModel_1.default.findByIdAndUpdate(id, { name, description }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ message: "Category not found" });
        res.json(mapCategory(updated));
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await categoryModel_1.default.findByIdAndDelete(id).lean();
        if (!deleted)
            return res.status(404).json({ message: "Category not found" });
        res.status(204).send();
    }
    catch (err) {
        res.status(400).json({ message: "Invalid id or request", error: err });
    }
};
exports.deleteCategory = deleteCategory;
