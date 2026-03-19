/**
 * Product & Payment API client - untuk halaman store/checkout
 */

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string | null;
};

export type PaymentStatus = {
  reference_id: string;
  status: string;
  amount: number;
  currency: string;
  channel_code?: string;
  checkout_url?: string;
};

export type Transaction = {
  id: string;
  referenceId: string;
  paymentRequestId: string | null;
  channelCode: string;
  type: string;
  country: string;
  currency: string;
  amount: number;
  requestAmount: number;
  status: string | null;
  description: string | null;
  checkoutUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const API = typeof window !== "undefined" ? "" : process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API}/api/products`);
  if (!res.ok) throw new Error("Gagal memuat produk");
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createCheckout(params: {
  reference_id: string;
  amount: number;
  description?: string;
}): Promise<{ checkout_url: string; reference_id: string; status: string }> {
  const res = await fetch(`${API}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal membuat checkout");
  return data;
}

export async function checkPaymentStatus(referenceId: string): Promise<PaymentStatus> {
  const res = await fetch(`${API}/api/status/${encodeURIComponent(referenceId)}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Payment tidak ditemukan");
  return data;
}

export async function fetchPayments(): Promise<Transaction[]> {
  const res = await fetch(`${API}/api/payments`);
  if (!res.ok) throw new Error("Gagal memuat riwayat");
  return res.json();
}

// Alias untuk kompatibilitas dengan halaman
export const productApi = {
  listProducts: fetchProducts,
  getProduct: fetchProduct,
  createCheckout,
  checkStatus: checkPaymentStatus,
  listPayments: fetchPayments,
};
