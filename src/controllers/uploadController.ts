import { Response } from "express";
import { User } from "../models/User";
import ProductModel from "../models/productModel";
import { validateFile, deleteFile } from "../utils/file.helper";
import { cloudinaryService } from "../services/cloudinaryService";

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// POST /api/upload/profile - Upload profile picture
export const uploadProfilePicture = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('File buffer length:', req.file.buffer?.length);
    console.log('USE_CLOUDINARY:', process.env.USE_CLOUDINARY);

    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let profilePicture: string;
    let url: string;

    if (process.env.USE_CLOUDINARY === 'true') {
      // Cloudinary upload
      const result = await cloudinaryService.uploadImage(req.file, 'profiles') as any;
      profilePicture = result.public_id;
      url = result.secure_url;
      
      // Delete old cloudinary image
      if (user.profilePicture && !user.profilePicture.startsWith('uploads/')) {
        await cloudinaryService.deleteImage(user.profilePicture);
      }
    } else {
      // Local upload - save buffer to disk
      const fs = require('fs');
      const path = require('path');
      const uploadDir = 'uploads/profiles';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `profilePicture-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      
      profilePicture = filepath;
      url = `/uploads/${filename}`;
      
      // Delete old local file
      if (user.profilePicture && user.profilePicture.startsWith('uploads/')) {
        deleteFile(user.profilePicture);
      }
    }

    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: { profilePicture, url }
    });
  } catch (error: any) {
    if (req.file && process.env.USE_CLOUDINARY !== 'true') deleteFile(req.file.path);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// POST /api/upload/product/:id - Upload product images
export const uploadProductImages = async (req: any, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check ownership for vendors
    if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const productDoc = product as any;
    productDoc.images = productDoc.images || [];
    const uploadedImages = [];

    if (process.env.USE_CLOUDINARY === 'true') {
      // Cloudinary uploads
      for (const file of files) {
        const result = await cloudinaryService.uploadImage(file, 'products') as any;
        productDoc.images.push(result.public_id);
        uploadedImages.push({ path: result.public_id, url: result.secure_url });
      }
    } else {
      // Local uploads
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          files.forEach(f => deleteFile(f.path));
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
  } catch (error: any) {
    if (req.files && process.env.USE_CLOUDINARY !== 'true') {
      (req.files as Express.Multer.File[]).forEach(f => deleteFile(f.path));
    }
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// DELETE /api/upload/product/:id/image - Delete product image
export const deleteProductImage = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (req.user.role === "vendor" && String(product.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const productDoc = product as any;
    productDoc.images = productDoc.images?.filter((img: string) => img !== imagePath) || [];
    await product.save();

    // Delete file
    if (imagePath.startsWith('uploads/')) {
      deleteFile(imagePath);
    } else {
      await cloudinaryService.deleteImage(imagePath);
    }

    res.status(200).json({ success: true, message: "Product image deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};