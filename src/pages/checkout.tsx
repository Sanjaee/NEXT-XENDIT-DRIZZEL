"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productApi } from "@/lib/product-api";

export default function CheckoutPage() {
  const router = useRouter();
  const [referenceId, setReferenceId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Pembayaran Produk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReferenceId("INV-" + Date.now());
    const params = new URLSearchParams(router.asPath.split("?")[1] || "");
    const amt = params.get("amount");
    if (amt) setAmount(amt);
  }, [router.asPath]);

  const handleCheckout = async () => {
    const ref = referenceId.trim();
    const amt = parseFloat(amount) || 0;
    const desc = description.trim() || "Pembayaran Produk";

    if (!ref || amt < 1000) {
      setError("Reference ID dan jumlah (min Rp 1.000) wajib diisi");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await productApi.createCheckout({
        reference_id: ref,
        amount: amt,
        description: desc,
      });

      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setError((res as { error?: string }).error || "Gagal membuat checkout");
      }
    } catch {
      setError("Request gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-md mx-auto w-full py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Checkout
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
              Redirect ke halaman pembayaran Xendit (Transfer Bank, E-Wallet, QRIS, dll.)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="referenceId">Reference ID (unik)</Label>
              <Input
                id="referenceId"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="INV-001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="amount">Jumlah (IDR)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="120000"
                min={1000}
                step={1000}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pembayaran Produk"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Bayar → Redirect ke Xendit"}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Kembali</Link>
            </Button>
            <Button variant="secondary" asChild className="flex-1">
              <Link href="/history">Riwayat</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
