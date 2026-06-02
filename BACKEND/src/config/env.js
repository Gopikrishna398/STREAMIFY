import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["MONGO_URI", "JWT_SECRET_KEY"];

if (!process.env.STREAM_API_KEY && !process.env.STEAM_API_KEY) {
  requiredEnv.push("STREAM_API_KEY");
}

if (!process.env.STREAM_API_SECRET && !process.env.STEAM_API_SECRET) {
  requiredEnv.push("STREAM_API_SECRET");
}

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

export const env = {
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET_KEY,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5001,
  streamApiKey: process.env.STREAM_API_KEY || process.env.STEAM_API_KEY,
  streamApiSecret: process.env.STREAM_API_SECRET || process.env.STEAM_API_SECRET,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
};
