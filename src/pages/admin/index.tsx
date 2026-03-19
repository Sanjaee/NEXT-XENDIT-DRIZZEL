"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, DollarSign, Clock } from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

type Stats = {
  productCount: number;
  transactionCount: number;
  totalRevenue: number;
  pendingCount: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) router.replace("/");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Admin Dashboard
        </h1>

        <div className="flex gap-2 mb-8">
          <Button variant="default" asChild>
            <Link href="/admin/products">Kelola Produk</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/transactions">Riwayat Transaksi</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{stats.productCount}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendapatan (Berhasil)</p>
                <p className="text-2xl font-bold">Rp {formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Bayar</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Gagal memuat statistik.</p>
        )}
      </main>
    </div>
  );
}
