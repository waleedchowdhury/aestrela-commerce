"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCardData } from "@/lib/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: ProductCardData, size: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function getKey(item: Pick<CartItem, "productId" | "size">) {
  return `${item.productId}:${item.size}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("aestrela-cart");
    if (!stored) return;

    try {
      setItems(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem("aestrela-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("aestrela-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, size) => {
        setItems((current) => {
          const key = `${product.id}:${size}`;
          const exists = current.find((item) => getKey(item) === key);
          if (exists) {
            return current.map((item) =>
              getKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [
            ...current,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              size,
              quantity: 1
            }
          ];
        });
        setIsOpen(true);
      },
      updateQuantity: (key, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => getKey(item) !== key)
            : current.map((item) => (getKey(item) === key ? { ...item, quantity } : item))
        );
      },
      count,
      subtotal
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
