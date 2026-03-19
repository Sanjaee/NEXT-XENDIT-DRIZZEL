"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/product-api";
import { ArrowLeft, Check, X, Clock } from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

function maskReferenceId(ref: string): string {
  const clean = ref.replace(/\s/g, "");
  if (clean.length <= 8) return ref;
  const last = clean.slice(-8);
  return `**** **** ${last.slice(0, 4)} ${last.slice(4)}`;
}

function formatDateTime(iso?: string | null): { time: string; date: string } {
  if (!iso) return { time: "-", date: "-" };
  try {
    const d = new Date(iso);
    return {
      time: d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      date: d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  } catch {
    return { time: "-", date: "-" };
  }
}

function formatChannel(channel?: string | null): string {
  if (!channel) return "-";
  const map: Record<string, string> = {
    HOSTED: "Virtual Account / E-Wallet",
    MANDIRI: "Mandiri",
    BCA: "BCA",
    BRI: "BRI",
    GOPAY: "GoPay",
    OVO: "OVO",
    DANA: "DANA",
  };
  return map[channel] || channel;
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
    createdAt?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    if (typeof reference_id !== "string") return;
    try {
      const res = await productApi.checkStatus(reference_id);
      if ((res as { error?: string }).error) {
        setError("Transaksi tidak ditemukan");
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
  const isSuccess = status === "SUCCEEDED" || status === "PAID";
  const isFailed =
    ["FAILED", "EXPIRED", "CANCELED", "CANCELLED"].includes(status);
  const isPending =
    !isSuccess && !isFailed && (status === "PENDING" || status === "UNPAID" || status === "");

  const { time, date } = formatDateTime(data?.createdAt);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <Navbar />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-black flex-1">
          Detail Pembayaran
        </h1>
      </div>

      <main className="flex-1 pt-4 lg:pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto w-full">
          {/* Desktop Title */}
          <h1 className="hidden lg:block text-2xl font-bold text-black mb-6">
            Detail Pembayaran
          </h1>

          {loading && !data && !error ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
              <div className="size-12 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-500">Memuat...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
              <div className="size-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <X className="size-8 text-zinc-500" />
              </div>
              <p className="font-semibold text-black mb-1">Transaksi Tidak Ditemukan</p>
              <p className="text-sm text-zinc-500 mb-6">{error}</p>
              <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          ) : data ? (
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              {/* Status Indicator */}
              <div className="p-8 text-center">
                <div
                  className={`size-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isSuccess
                      ? "bg-teal-600"
                      : isFailed
                        ? "bg-red-100"
                        : "bg-amber-100"
                  }`}
                >
                  {isSuccess ? (
                    <Check className="size-10 text-white" strokeWidth={3} />
                  ) : isFailed ? (
                    <X className="size-10 text-red-600" strokeWidth={2.5} />
                  ) : (
                    <Clock className="size-10 text-amber-600" strokeWidth={2} />
                  )}
                </div>
                <h2 className="text-xl font-bold text-black mb-1">
                  {isSuccess
                    ? "Pembayaran Berhasil"
                    : isFailed
                      ? "Pembayaran Gagal"
                      : "Menunggu Pembayaran"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {isSuccess
                    ? `Berhasil membayar ${data.currency || "IDR"} ${formatPrice(data.amount || 0)}`
                    : isFailed
                      ? "Transaksi gagal atau kedaluwarsa"
                      : "Selesaikan pembayaran di halaman Xendit"}
                </p>
              </div>

              {/* Details Section */}
              <div className="border-t border-zinc-100 px-6 py-4">
                <p className="text-xs font-bold text-black uppercase tracking-wide mb-4">
                  DETAILS
                </p>
                <div className="space-y-0 divide-y divide-zinc-100">
                  <DetailRow
                    label="ID Transaksi"
                    value={maskReferenceId(data.reference_id || "")}
                  />
                  <DetailRow label="Waktu" value={time} />
                  <DetailRow label="Tanggal" value={date} />
                  <DetailRow
                    label="Metode Pembayaran"
                    value={formatChannel(data.channel_code)}
                  />
                  <DetailRow
                    label="Total Pembayaran"
                    value={`${data.currency || "IDR"} ${formatPrice(data.amount || 0)}`}
                    bold
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 space-y-3">
                {data.checkout_url && isPending && (
                  <a
                    href={data.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      Buka Halaman Pembayaran
                    </Button>
                  </a>
                )}
                <Button
                  asChild
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Link href="/">Selesai</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={`text-sm text-black text-right ${bold ? "font-bold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
