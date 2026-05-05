"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { AnnouncementData } from "@/lib/types";

export function AnnouncementBar({ announcement }: { announcement: AnnouncementData }) {
  const content = (
    <motion.span
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      className="flex min-w-max gap-12 text-[11px] uppercase tracking-[0.28em]"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index}>{announcement.message}</span>
      ))}
    </motion.span>
  );

  return (
    <div className="fixed left-0 top-0 z-50 h-9 w-full overflow-hidden bg-champagne text-ink shadow-[0_1px_0_rgba(11,31,53,0.18)]">
      {announcement.href ? (
        <Link href={announcement.href} className="flex h-full items-center whitespace-nowrap">
          {content}
        </Link>
      ) : (
        <div className="flex h-full items-center whitespace-nowrap">{content}</div>
      )}
    </div>
  );
}
