import type { NextApiRequest, NextApiResponse } from "next";
import { db, products, transactions } from "@/db/index";
import { sql, eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);

    const [txCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions);

    const [totalRevenue] = await db
      .select({
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)::float`,
      })
      .from(transactions)
      .where(eq(transactions.status, "SUCCEEDED"));

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(eq(transactions.status, "PENDING"));

    return res.status(200).json({
      productCount: productCount?.count ?? 0,
      transactionCount: txCount?.count ?? 0,
      totalRevenue: Number(totalRevenue?.total ?? 0),
      pendingCount: pendingCount?.count ?? 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
