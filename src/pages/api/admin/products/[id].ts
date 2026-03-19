import type { NextApiRequest, NextApiResponse } from "next";
import { db, products } from "@/db/index";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) {
    return res.status(403).json({ error: "Admin only" });
  }

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id required" });

  if (req.method === "GET") {
    const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!p) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json(p);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { name, description, price, imageUrl } = req.body as {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
    };
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const updates: Partial<typeof products.$inferInsert> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    updates.updatedAt = new Date();

    try {
      const [updated] = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, id))
        .returning();
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Admin product update error:", error);
      return res.status(500).json({ error: "Failed to update product" });
    }
  }

  if (req.method === "DELETE") {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json({ deleted: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
