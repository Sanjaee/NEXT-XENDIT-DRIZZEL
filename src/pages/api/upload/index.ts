import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/admin-auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body as { image?: string };
  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "image (base64 data URI) required" });
  }

  // Validate base64 image format
  if (!image.startsWith("data:image/")) {
    return res.status(400).json({ error: "Invalid image format. Must be base64 data URI." });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "products",
      resource_type: "image",
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
}
