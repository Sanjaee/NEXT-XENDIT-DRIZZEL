import type { NextApiRequest, NextApiResponse } from "next";
import { db, transactions } from "@/db/index";
import { eq } from "drizzle-orm";
import { getInvoiceStatus } from "@/lib/xendit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const reference_id = req.query.reference_id as string;
  if (!reference_id) {
    return res.status(400).json({ error: "reference_id required" });
  }

  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.referenceId, reference_id))
      .limit(1);

    if (!tx) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Hosted Checkout: sync status dari Xendit
    if (tx.channelCode === "HOSTED" && tx.paymentRequestId) {
      try {
        const inv = await getInvoiceStatus(tx.paymentRequestId);
        await db
          .update(transactions)
          .set({ status: inv.status, updatedAt: new Date() })
          .where(eq(transactions.id, tx.id));
        return res.status(200).json({
          reference_id: tx.referenceId,
          status: inv.status,
          amount: tx.amount,
          currency: tx.currency,
          channel_code: tx.channelCode,
          checkout_url: tx.checkoutUrl,
        });
      } catch (e) {
        console.error("Xendit sync:", e);
      }
    }

    return res.status(200).json({
      reference_id: tx.referenceId,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      channel_code: tx.channelCode,
      checkout_url: tx.checkoutUrl,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({ error: "Failed to check status" });
  }
}
