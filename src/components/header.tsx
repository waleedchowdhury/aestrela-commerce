"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Info, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/components/cart-provider";
import type { AnnouncementData } from "@/lib/types";

export function Header({ announcement }: { announcement: AnnouncementData }) {
  const [solid, setSolid] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const active = solid || hovered;

  useEffect(() => {
    const onScroll = () => setSolid(pathname !== "/" || window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <>
      <AnnouncementBar announcement={announcement} />
      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-9 z-40 w-full transition duration-300 ${
          active ? "bg-white text-ink shadow-soft" : "bg-transparent text-pearl"
        }`}
      >
        <nav className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 md:px-8">
          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.22em] md:flex">
            <Link href="/#home" className="transition hover:text-champagne">
              Home
            </Link>
            <Link href="/#collection" className="transition hover:text-champagne">
              Collection
            </Link>
            <Link href="/shop" className="transition hover:text-champagne">
              Shop
            </Link>
          </div>

          <Link href="/#home" aria-label="AESTRÉLA home" className="relative h-12 w-44 md:w-56">
            <Image
              src="/brand/aestrela-logo-navbar-transparent.png"
              alt="AESTRÉLA"
              fill
              priority
              className={`object-contain transition duration-300 ${active ? "brightness-0" : "brightness-0 invert"}`}
            />
          </Link>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin"
              aria-label="Account"
              title="Account"
              className="grid h-10 w-10 place-items-center transition hover:text-champagne"
            >
              <CircleUserRound size={20} strokeWidth={1.4} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Cart"
              title="Cart"
              className="relative grid h-10 w-10 place-items-center transition hover:text-champagne"
            >
              <ShoppingBag size={20} strokeWidth={1.4} />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-champagne px-1 text-[10px] text-ink">
                  {count}
                </span>
              )}
            </button>
            <Link
              href="/about"
              aria-label="About"
              title="About"
              className="grid h-10 w-10 place-items-center transition hover:text-champagne"
            >
              <Info size={20} strokeWidth={1.4} />
            </Link>
          </div>
        </nav>
      </header>
      <CartDrawer />
    </>
  );
}
