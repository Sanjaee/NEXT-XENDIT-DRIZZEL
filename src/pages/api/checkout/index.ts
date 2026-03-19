import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { db, transactions } from "@/db/index";
import { createInvoice } from "@/lib/xendit";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function getBaseUrl(req: NextApiRequest): string {
  const base = process.env.NEXTAUTH_URL || process.env.BASE_URL;
  if (base) return base.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  const proto = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Login required untuk checkout" });
  }

  const { reference_id, amount, description } = req.body as {
    reference_id?: string;
    amount?: number;
    description?: string;
  };

  if (!reference_id || !amount || amount < 1000) {
    return res.status(400).json({ error: "reference_id and amount (min 1000) required" });
  }

  const desc = description || "Pembayaran Produk";
  const base = getBaseUrl(req);

  try {
    const invoice = await createInvoice({
      externalId: reference_id,
      amount: Math.round(amount),
      description: desc,
      currency: "IDR",
      successRedirectUrl: base + "/payment/" + reference_id + "?status=success",
      failureRedirectUrl: base + "/payment/" + reference_id + "?status=failure",
    });

    await db.insert(transactions).values({
      userId: session.user.id,
      referenceId: reference_id,
      paymentRequestId: invoice.id,
      channelCode: "HOSTED",
      type: "PAY",
      country: "ID",
      currency: "IDR",
      amount: amount,
      requestAmount: amount,
      status: invoice.status,
      description: desc,
      checkoutUrl: invoice.invoice_url,
    });

    return res.status(200).json({
      reference_id,
      checkout_url: invoice.invoice_url,
      status: invoice.status,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Gagal membuat checkout";
    return res.status(500).json({ error: msg });
  }
}
