import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import type { HeroData } from "@/lib/types";

export function Hero({ hero }: { hero: HeroData }) {
  return (
    <section id="home" className="relative min-h-[92vh] overflow-hidden bg-ink text-pearl">
      {hero.mediaType === "video" ? (
        <video className="absolute inset-0 h-full w-full object-cover" src={hero.mediaUrl} autoPlay muted loop playsInline />
      ) : (
        <MediaImage src={hero.mediaUrl} alt="" fill priority className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-ink/35" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end justify-center px-5 pb-16 pt-40 md:px-8 md:pb-20">
        <Link
          href="/shop-now"
          className="inline-flex min-w-44 justify-center border border-pearl/75 bg-ink/35 px-7 py-3 text-center text-xs uppercase tracking-[0.24em] text-pearl backdrop-blur-sm transition hover:border-champagne hover:bg-champagne hover:text-ink"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
