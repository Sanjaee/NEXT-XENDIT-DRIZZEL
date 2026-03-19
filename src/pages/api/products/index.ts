import type { NextApiRequest, NextApiResponse } from "next";
import { db, products } from "@/db/index";
import { eq } from "drizzle-orm";

const SEED_PRODUCTS = [
  { name: "Premium Headphones", description: "Noise cancelling wireless", price: 299000, imageUrl: "https://picsum.photos/400/300?random=1" },
  { name: "Smart Watch", description: "Health & fitness tracker", price: 899000, imageUrl: "https://picsum.photos/400/300?random=2" },
  { name: "Wireless Keyboard", description: "Mechanical RGB", price: 450000, imageUrl: "https://picsum.photos/400/300?random=3" },
  { name: "USB-C Hub", description: "7-in-1 adapter", price: 189000, imageUrl: "https://picsum.photos/400/300?random=4" },
  { name: "Desk Lamp", description: "LED adjustable", price: 159000, imageUrl: "https://picsum.photos/400/300?random=5" },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const list = await db.select().from(products).orderBy(products.createdAt);

    // Seed jika kosong (sama seperti Go seedProducts)
    if (list.length === 0) {
      for (const p of SEED_PRODUCTS) {
        await db.insert(products).values({
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
        });
      }
      const seeded = await db.select().from(products).orderBy(products.createdAt);
      return res.status(200).json(seeded);
    }

    return res.status(200).json(list);
  } catch (error) {
    console.error("Products list error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}
