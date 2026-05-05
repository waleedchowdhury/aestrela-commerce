"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const { addItem } = useCart();

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-[1.04]" />
        {product.isFeatured && (
          <span className="absolute left-3 top-3 bg-porcelain/90 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-ink">
            Highlight
          </span>
        )}
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-ink">{product.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/45">{product.category}</p>
          </div>
          <p className="text-sm text-ink">${product.price.toFixed(2)}</p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/62">{product.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`h-8 min-w-9 border px-2 text-xs transition ${
                size === option ? "border-ink bg-ink text-pearl" : "border-ink/15 hover:border-ink/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addItem(product, size)}
          className="mt-4 flex w-full items-center justify-center gap-2 bg-ink px-4 py-3 text-xs uppercase tracking-[0.2em] text-pearl transition hover:bg-champagne hover:text-ink"
        >
          <ShoppingBag size={15} strokeWidth={1.5} />
          Add
        </button>
      </div>
    </article>
  );
}
