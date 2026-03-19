import type { NextApiRequest, NextApiResponse } from "next";
import { db, transactions, users } from "@/db/index";
import { desc, eq } from "drizzle-orm";
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
    const list = await db
      .select({
        id: transactions.id,
        referenceId: transactions.referenceId,
        paymentRequestId: transactions.paymentRequestId,
        channelCode: transactions.channelCode,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
        checkoutUrl: transactions.checkoutUrl,
        createdAt: transactions.createdAt,
        userId: transactions.userId,
        userEmail: users.email,
        userFullName: users.fullName,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    return res.status(200).json(list);
  } catch (error) {
    console.error("Admin transactions error:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
