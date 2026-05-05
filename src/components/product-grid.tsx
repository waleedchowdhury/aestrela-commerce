"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { ProductCardData } from "@/lib/types";

const filters = ["New arrival", "Shop all", "Best sellers"];

export function ProductGrid({ products, showCategoryBar = false }: { products: ProductCardData[]; showCategoryBar?: boolean }) {
  const [active, setActive] = useState("Shop all");
  const visible = useMemo(() => {
    if (active === "Shop all") return products;
    if (active === "New arrival") return products.filter((product) => product.isNewArrival || product.category === "New arrival");
    return products.filter((product) => product.isBestSeller || product.category === "Best sellers");
  }, [active, products]);

  return (
    <section id="collection" className="bg-porcelain px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        {showCategoryBar && (
          <div className="sticky top-[116px] z-20 -mx-5 mb-10 border-b border-t thin-divider bg-porcelain/95 px-5 backdrop-blur md:-mx-8 md:px-8">
            <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActive(filter)}
                  className={`border-b py-4 text-xs uppercase tracking-[0.24em] transition ${
                    active === filter ? "border-ink text-ink" : "border-transparent text-ink/45 hover:text-ink"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {!showCategoryBar && (
          <div className="mb-10 flex items-end justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-champagne">Collection</p>
              <h2 className="mt-3 font-editorial text-4xl font-normal text-ink md:text-6xl">Selected pieces</h2>
            </div>
          </div>
        )}

        <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
