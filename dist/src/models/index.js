"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = exports.ProductModel = exports.CategoryModel = void 0;
const categoryModel_1 = __importDefault(require("./categoryModel"));
exports.CategoryModel = categoryModel_1.default;
const productModel_1 = __importDefault(require("./productModel"));
exports.ProductModel = productModel_1.default;
const cartModel_1 = __importDefault(require("./cartModel"));
exports.CartModel = cartModel_1.default;
exports.default = { CategoryModel: categoryModel_1.default, ProductModel: productModel_1.default, CartModel: cartModel_1.default };
