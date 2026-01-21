export interface Category {
  id: string;
  name: string;
  description?: string;
}

import mongoose from 'mongoose';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: mongoose.Types.ObjectId | string;
  inStock: boolean;
  quantity: number;
  images?: string[];
  createdBy?: mongoose.Types.ObjectId | string;
}

export interface CartItem {
  id: string;
  productId: mongoose.Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}
