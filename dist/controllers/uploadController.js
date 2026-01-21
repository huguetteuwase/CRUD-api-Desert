"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductImage = exports.uploadProductImages = exports.uploadProfilePicture = void 0;
const User_1 = require("../models/User");
const productModel_1 = __importDefault(require("../models/productModel"));
const file_helper_1 = require("../utils/file.helper");
const cloudinaryService_1 = require("../services/cloudinaryService");
// POST /api/upload/profile - Upload profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const userId = req.user._id;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let profilePicture;
        let url;
        if (process.env.USE_CLOUDINARY === 'true') {
            // Cloudinary upload
            const result = await cloudinaryService_1.cloudinaryService.uploadImage(req.file, 'profiles');
            profilePicture = result.public_id;
            url = result.secure_url;
            // Delete old cloudinary image
            if (user.profilePicture && !user.profilePicture.startsWith('uploads/')) {
                await cloudinaryService_1.cloudinaryService.deleteImage(user.profilePicture);
            }
        }
        else {
            // Local upload
            const validation = (0, file_helper_1.validateFile)(req.file);
            if (!validation.valid) {
                (0, file_helper_1.deleteFile)(req.file.path);
                return res.status(400).json({ error: validation.error });
            }
            profilePicture = req.file.path;
            url = `/uploads/${req.file.filename}`;
            // Delete old local file
            if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
                (0, file_helper_1.deleteFile)(user.profilePicture);
            }
        }
        user.profilePicture = profilePicture;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: { profilePicture, url }
        });
    }
    catch (error) {
        if (req.file && process.env.USE_CLOUDINARY !== 'true')
            (0, file_helper_1.deleteFile)(req.file.path);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
// POST /api/upload/product/:id - Upload product images
const uploadProductImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const productId = req.params.id;
        const product = await productModel_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        // Check ownership for vendors
        if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
            return res.status(403).json({ error: "Access denied" });
        }
        const productDoc = product;
        productDoc.images = productDoc.images || [];
        const uploadedImages = [];
        if (process.env.USE_CLOUDINARY === 'true') {
            // Cloudinary uploads
            for (const file of files) {
                const result = await cloudinaryService_1.cloudinaryService.uploadImage(file, 'products');
                productDoc.images.push(result.public_id);
                uploadedImages.push({ path: result.public_id, url: result.secure_url });
            }
        }
        else {
            // Local uploads
            for (const file of files) {
                const validation = (0, file_helper_1.validateFile)(file);
                if (!validation.valid) {
                    files.forEach(f => (0, file_helper_1.deleteFile)(f.path));
                    return res.status(400).json({ error: validation.error });
                }
                productDoc.images.push(file.path);
                uploadedImages.push({ path: file.path, url: `/uploads/${file.filename}` });
            }
        }
        await product.save();
        res.status(200).json({
            success: true,
            message: "Product images uploaded successfully",
            data: { images: uploadedImages, totalImages: productDoc.images.length }
        });
    }
    catch (error) {
        if (req.files && process.env.USE_CLOUDINARY !== 'true') {
            req.files.forEach(f => (0, file_helper_1.deleteFile)(f.path));
        }
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.uploadProductImages = uploadProductImages;
// DELETE /api/upload/product/:id/image - Delete product image
const deleteProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imagePath } = req.body;
        if (!imagePath) {
            return res.status(400).json({ error: "Image path is required" });
        }
        const product = await productModel_1.default.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
            return res.status(403).json({ error: "Access denied" });
        }
        const productDoc = product;
        productDoc.images = productDoc.images?.filter((img) => img !== imagePath) || [];
        await product.save();
        // Delete file
        if (imagePath.startsWith('uploads/')) {
            (0, file_helper_1.deleteFile)(imagePath);
        }
        else {
            await cloudinaryService_1.cloudinaryService.deleteImage(imagePath);
        }
        res.status(200).json({ success: true, message: "Product image deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
exports.deleteProductImage = deleteProductImage;
