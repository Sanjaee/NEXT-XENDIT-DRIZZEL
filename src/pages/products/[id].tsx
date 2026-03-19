"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi, type Product } from "@/lib/product-api";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== "string") return;
    productApi.getProduct(id).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  const handleBuy = () => {
    if (!product) return;
    const params = new URLSearchParams();
    params.set("amount", String(Math.round(product.price)));
    params.set("items", JSON.stringify([{ id: product.id, name: product.name, price: product.price, qty: 1 }]));
    router.push("/checkout?" + params.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8">
          <div className="animate-pulse grid gap-8 md:grid-cols-2">
            <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-6" />
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Produk tidak ditemukan</p>
          <Button asChild className="mt-4">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke produk
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized={product.imageUrl?.includes("picsum")}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {product.name}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              {product.description || "Tidak ada deskripsi"}
            </p>
            <p className="text-xl font-semibold mt-4">
              Rp {formatPrice(product.price)}
            </p>
            <Button size="lg" className="mt-6" onClick={handleBuy}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Beli Sekarang
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
