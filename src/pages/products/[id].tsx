"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi, type Product } from "@/lib/product-api";
import { ImageSlider } from "@/components/ui/ImageSlider";
import {
  ShoppingCart,
  ChevronRight,
  Star,
  Shield,
  Truck,
  Heart,
  Minus,
  Plus,
} from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>("M");

  useEffect(() => {
    if (typeof id !== "string") return;
    productApi
      .getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = () => {
    if (!product) return;
    const params = new URLSearchParams();
    params.set("amount", String(Math.round(product.price * qty)));
    params.set(
      "items",
      JSON.stringify([{ id: product.id, name: product.name, price: product.price, qty }])
    );
    router.push("/checkout?" + params.toString());
  };

  const images = product
    ? product.imageUrl
      ? [{ id: product.id, imageUrl: product.imageUrl, altText: product.name }]
      : [{ id: product.id, imageUrl: "/placeholder.png", altText: product.name }]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="flex-1 pt-20 px-4 max-w-6xl mx-auto w-full py-6">
          <div className="animate-pulse flex gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="aspect-square bg-zinc-200 rounded-lg" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-zinc-200 rounded w-3/4" />
              <div className="h-6 bg-zinc-200 rounded w-1/2" />
              <div className="h-4 bg-zinc-200 rounded w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="flex-1 pt-20 px-4 max-w-4xl mx-auto w-full py-8 text-center">
          <p className="text-zinc-600">Produk tidak ditemukan</p>
          <Button asChild className="mt-4 bg-black text-white hover:bg-zinc-800">
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </main>
      </div>
    );
  }

  const originalPrice = product.price * 1.2;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-black">
              Beranda
            </Link>
            <ChevronRight className="size-4" />
            <Link href="/" className="hover:text-black">
              Produk
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-black truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Image Gallery */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden sticky top-24">
              <ImageSlider
                images={images}
                showThumbnails={images.length > 1}
                showFullscreen
                height="500px"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex-1 min-w-0">
            {/* Promo Banner */}
            <div className="bg-black text-white rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">Flash Sale</span>
                <span className="text-zinc-300 text-xs">Berakhir dalam 02:45:30</span>
              </div>
              <button
                type="button"
                className="text-xs border border-white px-3 py-1 rounded hover:bg-white hover:text-black"
              >
                Ingatkan
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-2xl font-bold text-black">
                Rp {formatPrice(product.price)}
              </span>
              <span className="text-zinc-400 line-through text-sm">
                Rp {formatPrice(originalPrice)}
              </span>
              <span className="bg-zinc-200 text-black text-xs font-semibold px-2 py-0.5 rounded">
                {discount}%
              </span>
            </div>

            <h1 className="text-xl font-bold text-black mb-3">{product.name}</h1>

            {/* Trust badges & stats */}
            <div className="flex items-center gap-4 text-zinc-500 text-sm mb-6">
              <span className="flex items-center gap-1">
                <Shield className="size-4" />
                Original
              </span>
              <span className="flex items-center gap-1">
                <Truck className="size-4" />
                Gratis Retur
              </span>
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-black stroke-black" />
                5.0 (2)
              </span>
              <span>|</span>
              <span>9 terjual</span>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-black mb-2">Ukuran:</p>
              <div className="flex gap-2 flex-wrap">
                {["M", "L", "XL", "2XL"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded border text-sm font-medium ${
                      selectedSize === s
                        ? "border-black bg-black text-white"
                        : "border-zinc-300 bg-white text-black hover:border-zinc-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Voucher section */}
            <div className="border border-zinc-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-black mb-2">
                Pakai voucher biar hemat
              </p>
              <Link
                href="#"
                className="text-sm text-zinc-600 hover:text-black underline"
              >
                Lihat semua
              </Link>
            </div>

            {/* Store sidebar placeholder */}
            <div className="border border-zinc-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-zinc-200" />
                <div>
                  <p className="font-medium text-black">Toko Official</p>
                  <p className="text-zinc-500 text-sm flex items-center gap-1">
                    <Star className="size-3 fill-black stroke-black" /> 4.9
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto text-sm text-zinc-600 hover:text-black flex items-center gap-1"
                >
                  Lihat toko
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-sm text-zinc-500">
                <span>Metode pengiriman</span>
                <ChevronRight className="size-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white border border-zinc-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-3">Deskripsi</h2>
          <p className="text-zinc-600 text-sm">
            {product.description || "Tidak ada deskripsi tersedia."}
          </p>
        </div>
      </main>

      {/* Sticky Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-lg z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <div className="relative size-12 shrink-0 rounded overflow-hidden bg-zinc-100">
              <Image
                src={product.imageUrl || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={product.imageUrl?.includes("picsum")}
              />
            </div>
            <p className="font-medium text-black truncate max-w-[150px]">
              {product.name}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setQty((x) => Math.max(1, x - 1))}
              className="size-9 rounded border border-zinc-300 flex items-center justify-center hover:bg-zinc-50"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center font-medium text-black">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((x) => x + 1)}
              className="size-9 rounded border border-zinc-300 flex items-center justify-center hover:bg-zinc-50"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <p className="font-bold text-black shrink-0">
            Rp {formatPrice(product.price * qty)}
          </p>

          <div className="flex-1 flex justify-end gap-2">
            <button
              type="button"
              className="p-2 rounded border border-zinc-300 hover:bg-zinc-50"
              aria-label="Wishlist"
            >
              <Heart className="size-5 text-zinc-600" />
            </button>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-zinc-100"
              onClick={handleBuy}
            >
              Beli sekarang
            </Button>
            <Button
              className="bg-black text-white hover:bg-zinc-800"
              onClick={() => {
                const params = new URLSearchParams();
                params.set("amount", String(Math.round(product.price * qty)));
                params.set(
                  "items",
                  JSON.stringify([{ id: product.id, name: product.name, price: product.price, qty }])
                );
                router.push("/checkout?" + params.toString());
              }}
            >
              <ShoppingCart className="mr-2 size-4" />
              Tambah ke Bag
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-20" />
    </div>
  );
}
