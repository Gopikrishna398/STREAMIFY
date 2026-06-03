import { v2 as cloudinary } from "cloudinary";

const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    secure: true,
  });
}

export const uploadProfileImage = async (imageDataUrl, userId) => {
  if (!hasCloudinaryConfig) {
    throw new Error("Cloudinary is not configured");
  }

  try {
    const result = await cloudinary.uploader.upload(imageDataUrl, {
      folder: "streamify/profiles",
      overwrite: true,
      public_id: userId.toString(),
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    const cloudinaryMessage = error?.message || error?.error?.message || "Cloudinary upload failed";
    const statusCode = error?.http_code || error?.statusCode || 500;
    const uploadError = new Error(`Cloudinary upload failed: ${cloudinaryMessage}`);
    uploadError.statusCode = statusCode;
    throw uploadError;
  }
};
