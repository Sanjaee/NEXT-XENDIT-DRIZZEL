"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi, type Transaction } from "@/lib/product-api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function HistoryPage() {
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.listPayments().then(setPayments).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Riwayat Pembayaran
        </h1>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Belum ada riwayat pembayaran.
            </p>
            <Button asChild>
              <Link href="/checkout">Buat payment</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-3 px-2 font-medium">Reference ID</th>
                  <th className="text-left py-3 px-2 font-medium">Deskripsi</th>
                  <th className="text-left py-3 px-2 font-medium">Channel</th>
                  <th className="text-left py-3 px-2 font-medium">Amount</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-left py-3 px-2 font-medium">Tanggal</th>
                  <th className="text-left py-3 px-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 px-2">
                      <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {p.referenceId}
                      </code>
                    </td>
                    <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400 max-w-[150px] truncate">
                      {p.description || "-"}
                    </td>
                    <td className="py-3 px-2">{p.channelCode}</td>
                    <td className="py-3 px-2">
                      {p.currency} {formatPrice(p.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          (p.status || "").toUpperCase() === "SUCCEEDED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : (p.status || "").toUpperCase() === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {p.status || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {p.createdAt
                        ? format(new Date(p.createdAt), "dd MMM yyyy HH:mm", {
                            locale: id,
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/payment/${p.referenceId}`}>Detail</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
