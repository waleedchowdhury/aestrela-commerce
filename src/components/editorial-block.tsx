import { MediaImage } from "@/components/media-image";
import type { EditorialData } from "@/lib/types";

export function EditorialBlock({ editorial }: { editorial: EditorialData }) {
  return (
    <section className="bg-porcelain px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] xl:gap-16">
        <div className="relative aspect-[4/5] max-h-[660px] w-full overflow-hidden bg-mist">
          <MediaImage src={editorial.imageUrl} alt="AESTRELA editorial" fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">{editorial.label}</p>
          <blockquote className="mt-6 max-w-2xl font-editorial text-4xl font-normal leading-tight text-ink text-balance md:text-5xl xl:text-6xl">
            &quot;{editorial.quote}&quot;
          </blockquote>
          <p className="mt-7 max-w-xl text-sm font-light leading-7 text-ink/68 md:text-base">{editorial.body}</p>
        </div>
      </div>
    </section>
  );
}
