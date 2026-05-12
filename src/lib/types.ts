export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  imageUrl: string;
  images: string[];
  sizes: string[];
};

export type AnnouncementData = {
  message: string;
  href?: string | null;
};

export type HeroData = {
  title: string;
  subtitle: string;
  mediaUrl: string;
  mediaType: string;
  ctaLabel: string;
  ctaHref: string;
};

export type EditorialData = {
  label: string;
  quote: string;
  body: string;
  imageUrl: string;
};

export type FooterData = {
  designedIn: string;
  brandText: string;
  aboutText: string;
  trustText: string;
  facebookUrl: string;
  instagramUrl: string;
};

export type FooterNavData = {
  id: string;
  label: string;
  href: string;
};
