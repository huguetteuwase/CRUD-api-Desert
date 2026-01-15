import mongoose, { Schema, Document } from "mongoose";
import { Cart } from "../types";

export interface CartItem extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}
export interface CartDocument extends Omit<Cart, "items">, Document {
  items: mongoose.Types.DocumentArray<CartItem>;
}

const CartItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const CartSchema: Schema = new Schema<CartDocument>({
  userId: { type: String, required: true, unique: true },
  items: { type: [CartItemSchema], default: [] },
});

const CartModel = mongoose.model<CartDocument>("Cart", CartSchema);

export default CartModel;
