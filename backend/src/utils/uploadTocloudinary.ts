import cloudinary from './cloudinary.js';

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'productsPicture',
      // Optional: Add additional optimization settings
      quality: 'auto',
      fetch_format: 'auto',
    });
    
    console.log("Upload successful:", result.public_id);
    return result.secure_url;
    
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image to Cloudinary: ${error}`);
  }
};