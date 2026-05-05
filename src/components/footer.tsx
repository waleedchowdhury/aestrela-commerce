import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import type { FooterData, FooterNavData } from "@/lib/types";

export function Footer({ footer, navItems }: { footer: FooterData; navItems: FooterNavData[] }) {
  return (
    <footer className="bg-ink px-5 py-14 text-pearl md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-pearl/58">{footer.designedIn}</p>
          <h2 className="mt-6 font-editorial text-5xl font-normal">{footer.brandText}</h2>
          <p className="mt-5 max-w-sm text-sm font-light leading-7 text-pearl/68">{footer.aboutText}</p>
          <form action="/api/newsletter" method="post" className="mt-8 flex max-w-sm border-b border-pearl/35">
            <input
              name="email"
              aria-label="Email"
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-pearl/42"
            />
            <button type="submit" className="py-3 text-xs uppercase tracking-[0.22em] text-champagne">
              Join
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative h-28 w-28 md:h-32 md:w-32">
            <Image src="/brand/aestrela-emblem-transparent.png" alt="AESTRELA emblem" fill className="object-contain" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:justify-self-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-pearl/58">Navigation</p>
            <div className="mt-5 grid gap-3 text-sm text-pearl/72">
              {navItems.map((item) => (
                <Link key={item.id} href={item.href} className="transition hover:text-champagne">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-pearl/58">Trust</p>
            <p className="mt-5 max-w-xs text-sm leading-7 text-pearl/72">{footer.trustText}</p>
            <div className="mt-6 flex gap-3">
              <Link
                href={footer.facebookUrl}
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center border border-pearl/25 transition hover:border-champagne hover:text-champagne"
              >
                <Facebook size={18} strokeWidth={1.4} />
              </Link>
              <Link
                href={footer.instagramUrl}
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center border border-pearl/25 transition hover:border-champagne hover:text-champagne"
              >
                <Instagram size={18} strokeWidth={1.4} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
