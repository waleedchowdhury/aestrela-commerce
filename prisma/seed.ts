import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.announcement.upsert({
    where: { id: "launch-shipping" },
    update: {},
    create: {
      id: "launch-shipping",
      message: "Free shipping worldwide",
      href: "/shop"
    }
  });

  await prisma.heroContent.upsert({
    where: { id: "home" },
    update: {},
    create: {
      id: "home",
      title: "AESTRÉLA",
      subtitle: "Premium pieces shaped for quiet confidence, polished movement, and everyday ceremony.",
      mediaUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=85",
      mediaType: "image"
    }
  });

  await prisma.editorialContent.upsert({
    where: { id: "story" },
    update: {},
    create: {
      id: "story",
      label: "THE STORY",
      quote: "Luxury is the discipline of leaving only what matters.",
      body: "AESTRÉLA is designed in Chicago for wardrobes that move between sharp city days, late dinners, and the small rituals that make a piece feel personal.",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
    }
  });

  await prisma.footerContent.upsert({
    where: { id: "footer" },
    update: {},
    create: {
      id: "footer",
      designedIn: "Designed in Chicago",
      brandText: "AESTRÉLA",
      aboutText: "A premium fashion house focused on refined silhouettes, lasting materials, and a global standard of service.",
      trustText: "Secure checkout · Worldwide shipping · Premium support",
      facebookUrl: "https://facebook.com/",
      instagramUrl: "https://instagram.com/"
    }
  });

  const nav = [
    ["Shop", "/shop", 0],
    ["Collection", "/#collection", 1],
    ["About", "/about", 2],
    ["Contact", "mailto:hello@aestrela.com", 3]
  ] as const;

  for (const [label, href, sortOrder] of nav) {
    await prisma.footerNavItem.upsert({
      where: { id: `footer-${label.toLowerCase()}` },
      update: { label, href, sortOrder },
      create: { id: `footer-${label.toLowerCase()}`, label, href, sortOrder }
    });
  }

  const products = [
    {
      slug: "celeste-tailored-blazer",
      name: "Celeste Tailored Blazer",
      description: "A sculpted premium blazer with a satin-touch lining and clean shoulder line.",
      price: "248.00",
      category: "Best sellers",
      isFeatured: true,
      isBestSeller: true,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
    },
    {
      slug: "nocturne-silk-shirt",
      name: "Nocturne Silk Shirt",
      description: "Fluid silk shirting with a soft sheen and delicate collar structure.",
      price: "168.00",
      category: "New arrival",
      isFeatured: true,
      isNewArrival: true,
      image: "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?auto=format&fit=crop&w=1200&q=85"
    },
    {
      slug: "aurora-column-dress",
      name: "Aurora Column Dress",
      description: "An elegant column silhouette made for evenings, events, and refined travel.",
      price: "298.00",
      category: "Shop all",
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
    },
    {
      slug: "luna-wide-leg-trouser",
      name: "Luna Wide-Leg Trouser",
      description: "A clean wide-leg trouser with movement, drape, and a polished waist finish.",
      price: "188.00",
      category: "Shop all",
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85"
    }
  ];

  for (const product of products) {
    const { image, ...productData } = product;
    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData
    });

    await prisma.productImage.upsert({
      where: { id: `${record.slug}-main` },
      update: { url: image, alt: record.name },
      create: { id: `${record.slug}-main`, productId: record.id, url: image, alt: record.name }
    });

    for (const size of ["S", "M", "L", "XL", "XXL"]) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: record.id, size } },
        update: { stock: 24 },
        create: { productId: record.id, size, stock: 24 }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
