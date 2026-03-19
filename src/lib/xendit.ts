/**
 * Xendit API client - JS port dari Go main.go
 * Docs: https://docs.xendit.co/apidocs/create-payment-request
 */

const XENDIT_BASE_URL = "https://api.xendit.co";

function getAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("XENDIT_SECRET_KEY not set");
  }
  return "Basic " + Buffer.from(secretKey + ":").toString("base64");
}

/**
 * Create Hosted Checkout (Payment Link v2) - redirect ke checkout.xendit.co
 */
export async function createInvoice(params: {
  externalId: string;
  amount: number;
  description: string;
  currency?: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}): Promise<{
  id: string;
  invoice_url: string;
  status: string;
}> {
  const payload = {
    external_id: params.externalId,
    amount: params.amount,
    description: params.description,
    currency: params.currency || "IDR",
    invoice_duration: 86400,
    success_redirect_url: params.successRedirectUrl,
    failure_redirect_url: params.failureRedirectUrl,
  };

  const res = await fetch(XENDIT_BASE_URL + "/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (res.status !== 200 && res.status !== 201) {
    throw new Error((data.error_code as string) || (data.message as string) || "Xendit API error");
  }

  return {
    id: data.id as string,
    invoice_url: data.invoice_url as string,
    status: (data.status as string) || "PENDING",
  };
}

/**
 * Get invoice status (Hosted Checkout / Payment Link v2)
 */
export async function getInvoiceStatus(invoiceId: string): Promise<{
  status: string;
  id: string;
  invoice_url?: string;
}> {
  const res = await fetch(XENDIT_BASE_URL + "/v2/invoices/" + encodeURIComponent(invoiceId), {
    method: "GET",
    headers: { Authorization: getAuthHeader() },
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (res.status !== 200) {
    throw new Error((data.error_code as string) || (data.message as string) || "Xendit API error");
  }

  return {
    status: (data.status as string) || "",
    id: data.id as string,
    invoice_url: data.invoice_url as string,
  };
}
