"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { useCart } from "@/components/cart-provider";
import type { ProductCardData } from "@/lib/types";

export function ProductDetail({ product }: { product: ProductCardData }) {
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const gallery = product.images.length ? product.images : [product.imageUrl];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const { addItem } = useCart();
  const sizes = product.sizes.length ? product.sizes : ["S", "M", "L", "XL", "XXL"];

  return (
    <section className="bg-porcelain px-5 pb-20 pt-[148px] md:px-8 md:pb-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-16">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-mist">
            <MediaImage src={activeImage} alt={product.name} fill priority className="object-cover" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`View ${product.name} angle ${index + 1}`}
                  className={`relative aspect-[3/4] overflow-hidden bg-mist transition ${
                    activeImage === image ? "ring-2 ring-ink ring-offset-2 ring-offset-porcelain" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <MediaImage src={image} alt={`${product.name} angle ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">{product.category}</p>
          <h1 className="mt-4 font-editorial text-5xl font-normal leading-[0.95] text-ink md:text-7xl">{product.name}</h1>
          <p className="mt-6 text-lg text-ink">${product.price.toFixed(2)}</p>

          <div className="mt-10 border-y thin-divider py-8">
            <p className="text-xs uppercase tracking-[0.26em] text-ink/55">Description</p>
            <p className="mt-4 max-w-xl text-base leading-8 text-ink/70">{product.description}</p>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.26em] text-ink/55">Size</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`h-11 min-w-12 border px-3 text-xs uppercase tracking-[0.18em] transition ${
                    size === option ? "border-ink bg-ink text-pearl" : "border-ink/15 text-ink hover:border-ink/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => addItem(product, size)}
            className="mt-8 flex w-full max-w-xl items-center justify-center gap-2 bg-ink px-5 py-4 text-xs uppercase tracking-[0.22em] text-pearl transition hover:bg-champagne hover:text-ink"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            Add to cart
          </button>
        </div>
      </div>
    </section>
  );
}
