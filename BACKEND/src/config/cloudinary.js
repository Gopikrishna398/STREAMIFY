import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

const hasCloudinaryConfig =
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;

if (hasCloudinaryConfig) {
  cloudinary.config({
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    cloud_name: env.cloudinaryCloudName,
  });
}

export const uploadProfileImage = async (imageDataUrl, userId) => {
  if (!hasCloudinaryConfig) {
    throw new Error("Cloudinary is not configured");
  }

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
};
