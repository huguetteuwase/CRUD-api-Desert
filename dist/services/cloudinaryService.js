"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
class CloudinaryService {
    constructor() {
        this.initialized = false;
    }
    initialize() {
        if (!this.initialized) {
            cloudinary_1.v2.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            this.initialized = true;
        }
    }
    async uploadImage(file, folder) {
        this.initialize();
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' }
                ]
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(file.buffer);
        });
    }
    async deleteImage(publicId) {
        this.initialize();
        return cloudinary_1.v2.uploader.destroy(publicId);
    }
}
exports.cloudinaryService = new CloudinaryService();
