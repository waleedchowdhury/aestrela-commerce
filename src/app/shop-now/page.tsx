import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { getProducts } from "@/lib/store";

export const metadata = {
  title: "Shop Now | AESTRELA"
};

export default async function ShopNowPage() {
  const products = await getProducts();
  const highlighted = products.filter((product) => product.isFeatured || product.isNewArrival || product.isBestSeller);

  return (
    <main className="bg-porcelain pt-[116px]">
      <section className="px-5 pb-10 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">Shop Now</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-8">
            <h1 className="max-w-3xl font-editorial text-5xl font-normal leading-tight text-ink md:text-7xl">
              New arrivals and signature pieces.
            </h1>
            <Link
              href="/shop"
              className="border border-ink px-5 py-3 text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-pearl"
            >
              View all
            </Link>
          </div>
        </div>
      </section>
      <ProductGrid products={highlighted.length ? highlighted : products} showCategoryBar />
    </main>
  );
}
