import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables if available
const isCloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_URL) ||
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Uploads a profile avatar image URL (or local file/base64) to Cloudinary.
 * Falls back to the original image URL if Cloudinary is unconfigured or upload fails.
 * 
 * @param {string} imageUrl - The source image URL (e.g. Google profile picture URL)
 * @param {string} userIdentifier - Unique identifier (e.g. user ID or email prefix) for public_id
 * @returns {Promise<string>} Cloudinary secure CDN URL or fallback original URL
 */
export const uploadAvatarToCloudinary = async (imageUrl, userIdentifier) => {
  if (!imageUrl) return null;

  if (!isCloudinaryConfigured) {
    console.log('[Cloudinary] Missing credentials, using direct image URL:', imageUrl);
    return imageUrl;
  }

  try {
    const publicId = `avatar_${userIdentifier.toString().replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'jaas_avatars',
      public_id: publicId,
      overwrite: true,
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    console.log('[Cloudinary] Profile picture uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Failed to upload avatar, using original URL:', error.message);
    return imageUrl;
  }
};
