import { EditorialBlock } from "@/components/editorial-block";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { getHomeContent } from "@/lib/store";

export default async function HomePage() {
  const { hero, editorial, products } = await getHomeContent();

  return (
    <main>
      <Hero hero={hero} />
      <ProductGrid products={products.filter((product) => product.isFeatured).length ? products.filter((product) => product.isFeatured) : products} />
      <EditorialBlock editorial={editorial} />
    </main>
  );
}
