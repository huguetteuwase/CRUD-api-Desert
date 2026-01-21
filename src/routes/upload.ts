import { Router } from "express";
import { upload } from "../config/multer";
import {
  uploadProfilePicture,
  uploadProductImages,
  deleteProductImage,
} from "../controllers/uploadController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     tags: [File Upload]
 *     summary: Upload profile picture
 *     description: Upload or update user profile picture (authenticated users)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, max 1MB)
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Invalid file or no file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post("/profile", authenticate, upload.single("profilePicture"), uploadProfilePicture);

/**
 * @swagger
 * /api/upload/product/{id}:
 *   post:
 *     tags: [File Upload]
 *     summary: Upload product images
 *     description: Upload images for a product (vendor/admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (JPEG, PNG, GIF, max 1MB each)
 *     responses:
 *       200:
 *         description: Product images uploaded successfully
 *       400:
 *         description: Invalid files or no files uploaded
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 */
router.post("/product/:id", authenticate, authorize(["vendor", "admin"]), upload.array("images", 5), uploadProductImages);

/**
 * @swagger
 * /api/upload/product/{id}/image:
 *   delete:
 *     tags: [File Upload]
 *     summary: Delete product image
 *     description: Delete a specific product image (vendor/admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imagePath
 *             properties:
 *               imagePath:
 *                 type: string
 *                 example: uploads/products/image-123456789.jpg
 *     responses:
 *       200:
 *         description: Product image deleted successfully
 *       400:
 *         description: Image path required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 */
router.delete("/product/:id/image", authenticate, authorize(["vendor", "admin"]), deleteProductImage);

export default router;