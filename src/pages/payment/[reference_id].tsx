"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/product-api";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function PaymentStatusPage() {
  const router = useRouter();
  const { reference_id } = router.query;
  const [data, setData] = useState<{
    reference_id?: string;
    status?: string;
    amount?: number;
    currency?: string;
    channel_code?: string;
    checkout_url?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    if (typeof reference_id !== "string") return;
    try {
      const res = await productApi.checkStatus(reference_id);
      if ((res as { error?: string }).error) {
        setError("Payment tidak ditemukan");
        setData(null);
      } else {
        setData(res as typeof data);
        setError(null);
      }
    } catch {
      setError("Gagal memuat status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof reference_id !== "string") return;
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [reference_id]);

  const status = (data?.status || "").toUpperCase();
  const isFinal = ["SUCCEEDED", "FAILED", "EXPIRED", "CANCELED", "CANCELLED"].includes(status);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-md mx-auto w-full py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Status Pembayaran
          </h1>
          <p>
            Reference: <strong>{reference_id}</strong>
          </p>

          {loading && !data && !error ? (
            <p className="text-zinc-600 dark:text-zinc-400">Memuat...</p>
          ) : error ? (
            <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
          ) : data ? (
            <div className="space-y-2">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                    status === "SUCCEEDED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : status === "PENDING" || status === "UNPAID"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {data.status || "N/A"}
                </span>
              </p>
              <p>
                Amount: {data.currency || ""} {formatPrice(data.amount || 0)}
              </p>
              <p>Channel: {data.channel_code || "-"}</p>
              {data.checkout_url && (
                <a
                  href={data.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="default">Buka halaman pembayaran</Button>
                </a>
              )}
            </div>
          ) : null}

          <Button variant="outline" asChild>
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
