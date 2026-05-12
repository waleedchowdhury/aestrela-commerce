import { MediaImage } from "@/components/media-image";
import { getHomeContent } from "@/lib/store";

export const metadata = {
  title: "About | AESTRÉLA"
};

export default async function AboutPage() {
  const { editorial } = await getHomeContent();

  return (
    <main className="bg-porcelain px-5 pb-20 pt-40 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <MediaImage src={editorial.imageUrl} alt="AESTRÉLA atelier mood" fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.32em] text-champagne">About AESTRÉLA</p>
          <h1 className="mt-5 font-editorial text-5xl font-normal leading-tight text-ink md:text-7xl">
            Designed with restraint, made for presence.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-light leading-8 text-ink/68">{editorial.body}</p>
        </div>
      </div>
    </main>
  );
}
