import type { NextApiRequest, NextApiResponse } from "next";
import { db, products } from "@/db/index";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method === "GET") {
    try {
      const list = await db.select().from(products).orderBy(products.createdAt);
      return res.status(200).json(list);
    } catch (error) {
      console.error("Admin products list error:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  if (req.method === "POST") {
    const { name, description, price, imageUrl } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
    };
    if (!name || price == null || price < 0) {
      return res.status(400).json({ error: "name and price required" });
    }
    try {
      const [created] = await db
        .insert(products)
        .values({
          name,
          description: description || null,
          price: Number(price),
          imageUrl: imageUrl || null,
        })
        .returning();
      return res.status(201).json(created);
    } catch (error) {
      console.error("Admin product create error:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
