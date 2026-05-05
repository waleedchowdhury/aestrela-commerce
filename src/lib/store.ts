import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import {
  fallbackAnnouncement,
  fallbackEditorial,
  fallbackFooter,
  fallbackFooterNav,
  fallbackHero,
  fallbackProducts
} from "@/lib/fallback";
import type { ProductCardData } from "@/lib/types";

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export async function getProducts(): Promise<ProductCardData[]> {
  if (!isDatabaseConfigured()) return fallbackProducts;

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { stock: { gt: 0 } }, orderBy: { size: "asc" } }
      }
    });

    if (!products.length) return fallbackProducts;

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: toNumber(product.price),
      category: product.category,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      imageUrl: product.images[0]?.url ?? fallbackProducts[0].imageUrl,
      sizes: product.variants.map((variant) => variant.size)
    }));
  } catch {
    return fallbackProducts;
  }
}

export async function getHomeContent() {
  if (!isDatabaseConfigured()) {
    return {
      hero: fallbackHero,
      editorial: fallbackEditorial,
      products: fallbackProducts
    };
  }

  try {
    const [hero, editorial, products] = await Promise.all([
      prisma.heroContent.findUnique({ where: { id: "home" } }),
      prisma.editorialContent.findUnique({ where: { id: "story" } }),
      getProducts()
    ]);

    return {
      hero: hero ?? fallbackHero,
      editorial: editorial ?? fallbackEditorial,
      products
    };
  } catch {
    return {
      hero: fallbackHero,
      editorial: fallbackEditorial,
      products: fallbackProducts
    };
  }
}

export async function getSiteChrome() {
  if (!isDatabaseConfigured()) {
    return {
      announcement: fallbackAnnouncement,
      footer: fallbackFooter,
      footerNav: fallbackFooterNav
    };
  }

  try {
    const [announcement, footer, footerNav] = await Promise.all([
      prisma.announcement.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.footerContent.findUnique({ where: { id: "footer" } }),
      prisma.footerNavItem.findMany({ orderBy: { sortOrder: "asc" } })
    ]);

    return {
      announcement: announcement ?? fallbackAnnouncement,
      footer: footer ?? fallbackFooter,
      footerNav: footerNav.length ? footerNav : fallbackFooterNav
    };
  } catch {
    return {
      announcement: fallbackAnnouncement,
      footer: fallbackFooter,
      footerNav: fallbackFooterNav
    };
  }
}
