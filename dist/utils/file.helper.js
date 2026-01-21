"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = exports.deleteMultipleFiles = exports.deleteFile = void 0;
// src/utils/file.helper.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deleteFile = (filePath) => {
    const fullPath = path_1.default.join(__dirname, "../../", filePath);
    if (fs_1.default.existsSync(fullPath)) {
        fs_1.default.unlinkSync(fullPath);
        console.log("File deleted:" + filePath);
    }
};
exports.deleteFile = deleteFile;
const deleteMultipleFiles = (filePaths) => {
    filePaths.forEach((filePath) => {
        (0, exports.deleteFile)(filePath);
    });
};
exports.deleteMultipleFiles = deleteMultipleFiles;
// Validate file type and size
const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 1024 * 1024; // 1MB
    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: 'Only image files (JPEG, PNG, GIF) are allowed' };
    }
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 1MB' };
    }
    return { valid: true };
};
exports.validateFile = validateFile;
