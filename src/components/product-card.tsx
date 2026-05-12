"use client";

import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-mist">
          <MediaImage src={product.imageUrl} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/88 px-4 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-pearl transition duration-300 group-hover:translate-y-0">
            View details
          </div>
        </div>
      </Link>
      <div className="pt-4">
        {product.isFeatured && (
          <span className="mb-3 inline-flex bg-porcelain/90 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-ink">
            Highlight
          </span>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/products/${product.slug}`} className="text-sm uppercase tracking-[0.14em] text-ink transition hover:text-champagne">
              {product.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/45">{product.category}</p>
          </div>
          <p className="text-sm text-ink">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </article>
  );
}
