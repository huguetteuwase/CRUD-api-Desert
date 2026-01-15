import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem extends Document {
  productId: string;
  quantity: number;
}

export interface ICart extends Document {
  items: ICartItem[];
}

const CartItemSchema: Schema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Using userId as the _id
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const CartModel = mongoose.model<ICart>("Cart", CartSchema);

export default CartModel;
