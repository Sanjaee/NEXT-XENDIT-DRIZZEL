import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db, transactions } from "@/db/index";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    let query = db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    // User hanya lihat transaksi milik sendiri
    const list = await query.then((rows) =>
      rows.filter((t) => t.userId === session!.user!.id)
    );

    return res.status(200).json(list);
  } catch (error) {
    console.error("Payments list error:", error);
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
}
