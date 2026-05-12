"use client";

import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { MediaImage } from "@/components/media-image";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, subtotal } = useCart();
  const [status, setStatus] = useState<string | null>(null);

  async function checkout(provider: "stripe" | "paypal") {
    setStatus("Preparing checkout...");
    const response = await fetch(`/api/checkout/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    const data = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;
    if (!response.ok) {
      setStatus(data?.error ?? "Checkout is not configured yet.");
      return;
    }
    if (!data?.url) {
      setStatus("Checkout did not return a payment link.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <aside
      className={`fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-porcelain shadow-soft transition duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b thin-divider p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-ink/70">Cart</p>
          <button type="button" aria-label="Close cart" onClick={closeCart}>
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {items.length === 0 ? (
            <p className="pt-12 text-center text-sm text-ink/60">Your cart is waiting for something beautiful.</p>
          ) : (
            <div className="space-y-5">
              {items.map((item) => {
                const key = `${item.productId}:${item.size}`;
                return (
                  <div key={key} className="grid grid-cols-[84px_1fr] gap-4">
                    <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                      <MediaImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.12em]">{item.name}</p>
                          <p className="mt-1 text-xs text-ink/55">Size {item.size}</p>
                        </div>
                        <p className="text-sm">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center border thin-divider"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center border thin-divider"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t thin-divider p-5">
          <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.16em]">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!items.length}
              onClick={() => checkout("stripe")}
              className="bg-ink px-4 py-3 text-xs uppercase tracking-[0.2em] text-pearl disabled:opacity-35"
            >
              Stripe
            </button>
            <button
              type="button"
              disabled={!items.length}
              onClick={() => checkout("paypal")}
              className="border border-ink px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink disabled:opacity-35"
            >
              PayPal
            </button>
          </div>
          {status && <p className="mt-3 text-xs text-ink/60">{status}</p>}
        </div>
      </div>
    </aside>
  );
}
