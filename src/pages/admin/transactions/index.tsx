"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

type TransactionRow = {
  id: string;
  referenceId: string;
  channelCode: string;
  amount: number;
  currency: string;
  status: string | null;
  description: string | null;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  userFullName: string | null;
};

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [list, setList] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transactions", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) router.replace("/");
        return r.json();
      })
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-5xl mx-auto w-full py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Riwayat Transaksi (Semua User)
          </h1>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-3 font-medium">Reference</th>
                  <th className="text-left py-3 px-3 font-medium">User</th>
                  <th className="text-left py-3 px-3 font-medium">Deskripsi</th>
                  <th className="text-left py-3 px-3 font-medium">Channel</th>
                  <th className="text-left py-3 px-3 font-medium">Amount</th>
                  <th className="text-left py-3 px-3 font-medium">Status</th>
                  <th className="text-left py-3 px-3 font-medium">Tanggal</th>
                  <th className="text-left py-3 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-3 px-3">
                      <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {t.referenceId}
                      </code>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="text-sm font-medium">{t.userFullName || "-"}</p>
                        <p className="text-xs text-muted-foreground">{t.userEmail || "-"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground max-w-[120px] truncate">
                      {t.description || "-"}
                    </td>
                    <td className="py-3 px-3">{t.channelCode}</td>
                    <td className="py-3 px-3">
                      {t.currency} {formatPrice(t.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          (t.status || "").toUpperCase() === "SUCCEEDED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : (t.status || "").toUpperCase() === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {t.status || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">
                      {t.createdAt
                        ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm", { locale: id })
                        : "-"}
                    </td>
                    <td className="py-3 px-3">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/payment/${t.referenceId}`}>Detail</Link>
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
