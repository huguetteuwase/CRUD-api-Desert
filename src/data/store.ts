import { Category, Product, Cart } from "../types";

// Deterministic seed IDs so you can copy/paste them in Postman when testing
export const categories: Category[] = [
  { id: "6f7b5b8a-4c2d-4e2a-9a2f-1b0a2c3d4e5f", name: "Books", description: "All books" },
  { id: "b1a2c3d4-e5f6-4789-8abc-0123456789ab", name: "Electronics", description: "Gadgets and devices" },
];

export const products: Product[] = [
  { id: "11111111-2222-4333-8444-555555555555", name: "Novel", price: 9.99, description: "A great read", categoryId: "6f7b5b8a-4c2d-4e2a-9a2f-1b0a2c3d4e5f", inStock: true, quantity: 10 },
  { id: "66666666-7777-8888-9999-aaaaaaaaaaaa", name: "Headphones", price: 29.99, description: "Noise-cancelling", categoryId: "b1a2c3d4-e5f6-4789-8abc-0123456789ab", inStock: true, quantity: 5 },
];

export const carts: Record<string, Cart> = {
    
};
