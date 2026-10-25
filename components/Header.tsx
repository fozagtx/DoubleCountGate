"use client";

import { useEffect, useState } from "react";
import { LeafIcon } from "@/components/Icons";
import { WalletEntryButton } from "@/components/WalletEntryButton";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "Questions" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent bg-paper"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-marketing items-center justify-between gap-4 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2 text-ink" aria-label="Faircri home">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-forest text-sheet">
            <LeafIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-[22px] font-bold tracking-[-0.03em]">faircri</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-[15px] font-medium text-lead hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <WalletEntryButton
          label="Open app"
          connectedLabel="Open app"
          className="btn-dark inline-flex min-h-10 items-center justify-center rounded-[10px] px-4 text-sm font-semibold text-sheet"
        />
      </div>
    </header>
  );
}
