"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { productApi, type Product } from "@/lib/product-api";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);

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
      next = cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      next = [...cart, { id: p.id, name: p.name, price: p.price, qty: 1 }];
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-20 px-4 pb-24 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Produk
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Demo Payment Gateway Xendit - Pilih produk dan lanjut ke checkout
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
                <CardContent className="pt-4">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${p.id}`} className="block">
                  <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <Image
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={p.imageUrl?.includes("picsum")}
                    />
                  </div>
                </Link>
                <CardContent className="pt-4">
                  <Link href={`/products/${p.id}`}>
                    <CardTitle className="line-clamp-1 hover:text-primary">
                      {p.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 mt-1">
                    {p.description || "-"}
                  </CardDescription>
                  <p className="font-semibold text-lg mt-2">
                    Rp {formatPrice(p.price)}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => addToCart(p)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Tambah ke keranjang
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/products/${p.id}`}>
                      Detail <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Cart bar - sama seperti Go templates */}
        {cart.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40 px-4 py-3 flex items-center justify-between"
            data-testid="cart-bar"
          >
            <span className="font-medium">
              {totalItems} item - Rp {formatPrice(totalAmount)}
            </span>
            <Button onClick={goCheckout}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Lanjut Checkout
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
