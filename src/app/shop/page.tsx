import { ProductGrid } from "@/components/product-grid";
import { getProducts } from "@/lib/store";

export const metadata = {
  title: "Shop | AESTRÉLA"
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="pt-[116px]">
      <section className="bg-porcelain px-5 pb-10 pt-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">Shop</p>
          <h1 className="mt-3 font-editorial text-5xl font-normal text-ink md:text-7xl">Collection</h1>
        </div>
      </section>
      <ProductGrid products={products} showCategoryBar />
    </main>
  );
}
