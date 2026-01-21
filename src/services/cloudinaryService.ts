import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

class CloudinaryService {
  private initialized = false;

  private initialize() {
    if (!this.initialized) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.initialized = true;
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string) {
    this.initialize();
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    this.initialize();
    return cloudinary.uploader.destroy(publicId);
  }
}

export const cloudinaryService = new CloudinaryService();