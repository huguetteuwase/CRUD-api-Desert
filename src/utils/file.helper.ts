// src/utils/file.helper.ts
import fs from "fs";
import path from "path";

export const deleteFile = (filePath: string): void => {
  const fullPath = path.join(__dirname, "../../", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log("File deleted:" + filePath);
  }
};

export const deleteMultipleFiles = (filePaths: string[]): void => {
  filePaths.forEach((filePath) => {
    deleteFile(filePath);
  });
};

// Validate file type and size
export const validateFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
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
