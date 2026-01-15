import mongoose, { Schema, Document } from "mongoose";
import { Category } from "../types";

export interface CategoryDocument extends Category, Document {
  legacyId?: string;
}

const CategorySchema: Schema = new Schema<CategoryDocument>({
  name: { type: String, required: true },
  description: { type: String },
  legacyId: { type: String, index: true, unique: true, sparse: true },
});

const CategoryModel = mongoose.model<CategoryDocument>(
  "Category",
  CategorySchema
);

export default CategoryModel;
