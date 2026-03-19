"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/general/Navbar";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/product-api";
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  Check,
  Shield,
  Tag,
  FileText,
  Minus,
  Plus,
} from "lucide-react";

type CartItem = { id: string; name: string; price: number; qty: number; imageUrl?: string | null };

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID").format(price);
}

const SHIPPING_OPTIONS = [
  { id: "kargo", name: "Kargo", cost: 15000, estimate: "2-4 hari" },
  { id: "reguler", name: "Reguler", cost: 10000, estimate: "3-5 hari" },
  { id: "express", name: "Express", cost: 25000, estimate: "1-2 hari" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [protectionDiscount, setProtectionDiscount] = useState(false);
  const [shippingInsurance, setShippingInsurance] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(router.asPath.split("?")[1] || "");
    const amt = params.get("amount");
    const itemsStr = params.get("items");
    try {
      if (itemsStr) {
        const parsed = JSON.parse(itemsStr) as CartItem[];
        setItems(Array.isArray(parsed) ? parsed : []);
      }
      if (amt) setSubtotal(parseFloat(amt) || 0);
    } catch {
      setItems([]);
    }
  }, [router.asPath]);

  const itemDiscount = protectionDiscount ? Math.round(subtotal * 0.05) : 0;
  const shippingCost = selectedShipping?.cost || 0;
  const insuranceCost = shippingInsurance ? 5000 : 0;
  const total = Math.max(0, subtotal - itemDiscount + shippingCost + insuranceCost);

  const handleQtyChange = (index: number, delta: number) => {
    const next = items.map((it, i) => {
      if (i !== index) return it;
      const qty = Math.max(1, it.qty + delta);
      return { ...it, qty };
    });
    setItems(next);
    setSubtotal(next.reduce((s, it) => s + it.price * it.qty, 0));
  };

  const description =
    items.length > 0
      ? `Pembelian: ${items.map((i) => `${i.name} x${i.qty}`).join(", ")}`
      : "Pembayaran Produk";

  const handleCheckout = async () => {
    if (total < 1000) {
      setError("Total minimal Rp 1.000");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await productApi.createCheckout({
        reference_id: "INV-" + Date.now(),
        amount: total,
        description,
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

  const address = {
    name: "Rumah • Ahmad Afriza",
    full: "Jl. Contoh No. 123, Kelurahan Contoh, Kecamatan Contoh, Kota Jakarta",
    phone: "08123456789",
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-black flex-1">Checkout</h1>
      </div>

      <main className="flex-1 pt-4 lg:pt-20 px-4 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Title */}
          <h1 className="hidden lg:block text-2xl font-bold text-black mb-6">Checkout</h1>

          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Shipping Address */}
              <section className="bg-white rounded-lg border border-zinc-200 p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                  Alamat Pengiriman
                </p>
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black">{address.name}</p>
                    <p className="text-sm text-zinc-600 mt-1">{address.full}</p>
                    <p className="text-sm text-zinc-500 mt-1">{address.phone}</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-black border border-zinc-300 px-3 py-1.5 rounded hover:bg-zinc-50 shrink-0"
                  >
                    Ganti
                  </button>
                </div>
              </section>

              {/* Order Items */}
              <section className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
                  <div className="size-4 rounded-full border-2 border-black flex items-center justify-center">
                    <Check className="size-2.5 text-black" />
                  </div>
                  <span className="font-semibold text-black">Toko Official</span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <p>Belum ada item. Kembali ke beranda untuk memilih produk.</p>
                      <Button asChild className="mt-4 bg-black hover:bg-zinc-800">
                        <Link href="/">Pilih Produk</Link>
                      </Button>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-4 flex gap-4"
                      >
                        <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                          <Image
                            src={item.imageUrl || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black line-clamp-2">{item.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Variant: Standar</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 border border-zinc-300 rounded">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(idx, -1)}
                                className="size-8 flex items-center justify-center hover:bg-zinc-50"
                              >
                                <Minus className="size-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(idx, 1)}
                                className="size-8 flex items-center justify-center hover:bg-zinc-50"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <p className="font-bold text-black">
                              Rp {formatPrice(item.price * item.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <>
                    <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Diskon Proteksi</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={protectionDiscount}
                          onChange={(e) => setProtectionDiscount(e.target.checked)}
                          className="size-4 rounded border-zinc-300"
                        />
                        <span className="text-sm text-zinc-600">Aktifkan</span>
                      </label>
                    </div>

                    <div className="px-4 py-3 border-t border-zinc-100">
                      <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedShipping(
                              SHIPPING_OPTIONS[
                                (SHIPPING_OPTIONS.indexOf(selectedShipping) + 1) %
                                  SHIPPING_OPTIONS.length
                              ]
                            )
                          }
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div>
                            <p className="font-medium text-black">{selectedShipping?.name}</p>
                            <p className="text-sm text-zinc-500">
                              Rp {formatPrice(shippingCost)} • {selectedShipping?.estimate}
                            </p>
                          </div>
                          <ChevronRight className="size-5 text-zinc-400" />
                        </button>
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shippingInsurance}
                            onChange={(e) => setShippingInsurance(e.target.checked)}
                            className="size-4 rounded border-zinc-300"
                          />
                          <span className="text-sm text-zinc-600">
                            Pakai Asuransi Pengiriman (+Rp 5.000)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-zinc-100">
                      <label className="block text-sm text-zinc-600 mb-2">Kasih Catatan</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value.slice(0, 200))}
                        placeholder="Catatan untuk penjual..."
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm resize-none"
                        rows={2}
                        maxLength={200}
                      />
                      <p className="text-xs text-zinc-400 mt-1">{note.length}/200</p>
                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Promo */}
                <button
                  type="button"
                  className="w-full bg-white rounded-lg border border-zinc-200 p-4 flex items-center justify-between hover:bg-zinc-50"
                >
                  <span className="flex items-center gap-2 text-zinc-600">
                    <Tag className="size-5" />
                    Makin hemat pakai promo
                  </span>
                  <ChevronRight className="size-5 text-zinc-400" />
                </button>

                {/* Summary */}
                <section className="bg-white rounded-lg border border-zinc-200 p-4">
                  {itemDiscount > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-600">Diskon Barang</span>
                      <span className="font-medium text-black">-Rp {formatPrice(itemDiscount)}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSummary(!showSummary)}
                    className="w-full flex items-center justify-between py-2 text-sm text-zinc-600 hover:text-black"
                  >
                    <FileText className="size-4" />
                    Cek ringkasan transaksimu, yuk
                    <ChevronRight
                      className={`size-4 transition-transform ${showSummary ? "rotate-90" : ""}`}
                    />
                  </button>
                  {showSummary && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 space-y-1 text-sm text-zinc-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp {formatPrice(subtotal)}</span>
                      </div>
                      {itemDiscount > 0 && (
                        <div className="flex justify-between text-black">
                          <span>Diskon</span>
                          <span>-Rp {formatPrice(itemDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Ongkir</span>
                        <span>Rp {formatPrice(shippingCost)}</span>
                      </div>
                      {insuranceCost > 0 && (
                        <div className="flex justify-between">
                          <span>Asuransi</span>
                          <span>Rp {formatPrice(insuranceCost)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200">
                    <p className="font-semibold text-black">Total Tagihan</p>
                    <p className="text-xl font-bold text-black">Rp {formatPrice(total)}</p>
                  </div>
                  {items.length > 0 && (
                    <Button
                      className="w-full mt-4 bg-black text-white hover:bg-zinc-800"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      <Shield className="size-4 mr-2" />
                      {loading ? "Memproses..." : "Bayar Sekarang"}
                    </Button>
                  )}
                  <p className="text-xs text-zinc-400 mt-3">
                    Dengan menekan tombol Bayar Sekarang, kamu menyetujui syarat dan ketentuan
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer - Mobile only */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500">Total Tagihan</p>
              <p className="text-lg font-bold text-black">Rp {formatPrice(total)}</p>
            </div>
            <Button
              className="bg-black text-white hover:bg-zinc-800 shrink-0 px-6"
              onClick={handleCheckout}
              disabled={loading}
            >
              <Shield className="size-4 mr-2" />
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm z-50">
          {error}
        </div>
      )}
    </div>
  );
}
