import type { NextApiRequest, NextApiResponse } from "next";
import { db, transactions } from "@/db/index";
import { eq } from "drizzle-orm";

/**
 * Xendit Webhook - menerima callback status pembayaran (Invoice v2, dll.)
 * URL: https://yourdomain.com/api/webhooks/xendit
 *
 * Setup di Xendit Dashboard:
 * Settings → Webhooks → Add Webhook
 * Callback URL: https://yourdomain.com/api/webhooks/xendit
 * Event: invoice.paid, invoice.expired, dll.
 *
 * Optional: set XENDIT_WEBHOOK_VERIFICATION_TOKEN di .env
 * (harus sama dengan token di Xendit Dashboard)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verifikasi token (jika di-set di .env)
  const verificationToken = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
  const callbackToken = req.headers["x-callback-token"] as string | undefined;
  if (verificationToken && callbackToken !== verificationToken) {
    console.warn("[Xendit webhook] Invalid or missing x-callback-token");
    return res.status(401).json({ error: "Invalid webhook token" });
  }

  try {
    const body = req.body as Record<string, unknown>;

    // Support berbagai format payload Xendit (Invoice, Bill, dll.)
    const data = body.data as Record<string, unknown> | undefined;
    const inner = data?.data as Record<string, unknown> | undefined;
    const externalId =
      (body.external_id as string) ?? (data?.external_id as string) ?? (inner?.reference_id as string);
    const invoiceId =
      (body.id as string) ?? (data?.id as string) ?? (inner?.payment_id as string);
    const status =
      (body.status as string) ?? (data?.status as string) ?? (inner?.status as string);

    const referenceId = externalId || invoiceId;
    if (!referenceId || !status) {
      console.warn("[Xendit webhook] Missing reference_id or status:", body);
      return res.status(200).json({ received: true }); // 200 agar Xendit tidak retry
    }

    // Update transaksi di DB (by reference_id atau payment_request_id)
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.referenceId, String(referenceId)))
      .limit(1);

    if (!tx) {
      const [txByInvoice] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.paymentRequestId, String(invoiceId || referenceId)))
        .limit(1);
      const target = txByInvoice;
      if (target) {
        await db
          .update(transactions)
          .set({ status: String(status).toUpperCase(), updatedAt: new Date() })
          .where(eq(transactions.id, target.id));
      }
    } else {
      await db
        .update(transactions)
        .set({ status: String(status).toUpperCase(), updatedAt: new Date() })
        .where(eq(transactions.id, tx.id));
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Xendit webhook] Error:", error);
    return res.status(200).json({ received: true }); // Tetap 200 agar Xendit tidak retry berulang
  }
}
