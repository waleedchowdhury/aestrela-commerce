import type {
  AnnouncementData,
  EditorialData,
  FooterData,
  FooterNavData,
  HeroData,
  ProductCardData
} from "@/lib/types";

export const fallbackAnnouncement: AnnouncementData = {
  message: "Free shipping worldwide",
  href: "/shop"
};

export const fallbackHero: HeroData = {
  title: "AESTRÉLA",
  subtitle: "Premium pieces shaped for quiet confidence, polished movement, and everyday ceremony.",
  mediaUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=85",
  mediaType: "image",
  ctaLabel: "Shop the collection",
  ctaHref: "/shop"
};

export const fallbackEditorial: EditorialData = {
  label: "THE STORY",
  quote: "Luxury is the discipline of leaving only what matters.",
  body: "AESTRÉLA is designed in Chicago for wardrobes that move between sharp city days, late dinners, and the small rituals that make a piece feel personal.",
  imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
};

export const fallbackFooter: FooterData = {
  designedIn: "Designed in Chicago",
  brandText: "AESTRÉLA",
  aboutText: "A premium fashion house focused on refined silhouettes, lasting materials, and a global standard of service.",
  trustText: "Secure checkout · Worldwide shipping · Premium support",
  facebookUrl: "https://facebook.com/",
  instagramUrl: "https://instagram.com/"
};

export const fallbackFooterNav: FooterNavData[] = [
  { id: "shop", label: "Shop", href: "/shop" },
  { id: "collection", label: "Collection", href: "/#collection" },
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "mailto:hello@aestrela.com" }
];

export const fallbackProducts: ProductCardData[] = [
  {
    id: "celeste-tailored-blazer",
    slug: "celeste-tailored-blazer",
    name: "Celeste Tailored Blazer",
    description: "A sculpted premium blazer with a satin-touch lining and clean shoulder line.",
    price: 248,
    category: "Best sellers",
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "nocturne-silk-shirt",
    slug: "nocturne-silk-shirt",
    name: "Nocturne Silk Shirt",
    description: "Fluid silk shirting with a soft sheen and delicate collar structure.",
    price: 168,
    category: "New arrival",
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "aurora-column-dress",
    slug: "aurora-column-dress",
    name: "Aurora Column Dress",
    description: "An elegant column silhouette made for evenings, events, and refined travel.",
    price: 298,
    category: "Shop all",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "luna-wide-leg-trouser",
    slug: "luna-wide-leg-trouser",
    name: "Luna Wide-Leg Trouser",
    description: "A clean wide-leg trouser with movement, drape, and a polished waist finish.",
    price: 188,
    category: "Shop all",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  }
];
