import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getProductBySlug, getProducts } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `${product.name} | AESTRÉLA` : "Product | AESTRÉLA",
    description: product?.description
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <ProductDetail product={product} />
    </main>
  );
}
