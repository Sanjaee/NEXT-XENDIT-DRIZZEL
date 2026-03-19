"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi, type Product } from "@/lib/product-api";
import { ShoppingCart, Star, MapPin, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const rating = 4.9;
  const sold = "50+";
  const location = "Kota Jakarta";
  const discount = (product.id.charCodeAt(0) % 2) === 0 ? "19%" : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/products/${product.id}`} className="block flex-1">
        <div className="relative aspect-square bg-zinc-50 overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            unoptimized={product.imageUrl?.includes("picsum")}
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-0.5 rounded">
              {discount}
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <h3 className="text-black font-medium text-sm line-clamp-2 min-h-10">
            {product.name}
          </h3>
          <p className="text-black font-bold text-base mt-1">
            Rp{formatPrice(product.price)}
          </p>
          <p className="text-zinc-500 text-xs mt-1">Gratis ongkir</p>
          <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-xs">
            <Star className="size-3.5 fill-amber-400 stroke-amber-400" />
            <span>{rating}</span>
            <span className="text-zinc-300">|</span>
            <span>{sold} terjual</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-zinc-500 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {location}
            </span>
            <button
              type="button"
              className="p-1 hover:bg-zinc-100 rounded"
              onClick={(e) => {
                e.preventDefault();
              }}
              aria-label="Menu"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </Link>
      <div className="p-3 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-black text-black hover:bg-zinc-100"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product);
          }}
        >
          <ShoppingCart className="mr-1.5 size-4" />
          Keranjang
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; imageUrl?: string | null }[]>([]);

  useEffect(() => {
    productApi.listProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addToCart = (p: Product) => {
    const existing = cart.find((i) => i.id === p.id);
    let next: typeof cart;
    if (existing) {
      next = cart.map((i) =>
        i.id === p.id ? { ...i, qty: i.qty + 1, imageUrl: i.imageUrl ?? p.imageUrl } : i
      );
    } else {
      next = [...cart, { id: p.id, name: p.name, price: p.price, qty: 1, imageUrl: p.imageUrl }];
    }
    setCart(next);
    toast({ title: "Ditambah ke keranjang", description: `${p.name} (${(existing?.qty ?? 0) + 1} item)` });
  };

  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const goCheckout = () => {
    const params = new URLSearchParams();
    params.set("amount", String(Math.round(totalAmount)));
    params.set("items", JSON.stringify(cart));
    router.push("/checkout?" + params.toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-1 pt-20 px-4 pb-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">Daftar Produk</h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Pilih produk dan lanjut ke checkout
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-zinc-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                    <div className="h-4 bg-zinc-200 rounded w-2/3" />
                    <div className="h-6 bg-zinc-200 rounded w-1/2" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-lg z-40 px-4 py-3 flex items-center justify-between"
            data-testid="cart-bar"
          >
            <span className="font-medium text-black">
              {totalItems} item - Rp {formatPrice(totalAmount)}
            </span>
            <Button
              onClick={goCheckout}
              className="bg-black text-white hover:bg-zinc-800"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Lanjut Checkout
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
