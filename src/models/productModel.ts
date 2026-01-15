import mongoose, { Schema, Document } from 'mongoose';
import { Product } from '../types';

export interface ProductDocument extends Product, Document {}

const ProductSchema: Schema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true } as any,
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
});

const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema);

export default ProductModel;
