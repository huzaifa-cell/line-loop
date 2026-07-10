"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
];

const mobileMenuItems = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Track Order", href: "/track-order" },
  { label: "Account", href: "/account" },
];

/**
 * Thin text-only navigation bar. Transparent over the dark hero,
 * switching to warm-parchment background with black text once scrolled.
 * Mobile: "MENU" opens a full-screen overlay; "Search" opens the search overlay.
 */
export default function Nav() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change — handled in click handlers, not effect

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOpen]);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("lineloop:search-open"));
  };

  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-colors duration-300",
          solid
            ? "bg-warm-parchment text-ink-black border-b border-ink-black/15"
            : "bg-transparent text-ivory-mist border-b border-transparent"
        )}
      >
        <nav className="mx-auto max-w-[var(--page-max-width)] px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="caption font-bold tracking-[0.13em]"
            aria-label="LINE&LOOP home"
          >
            LINE&LOOP
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-[var(--spacing-30)]">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="caption uppercase link-underline"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={openSearch}
              className="caption uppercase link-underline"
              aria-label="Search"
            >
              Search
            </button>
            <button
              onClick={open}
              className="caption uppercase link-underline"
              aria-label="Open cart"
            >
              Bag{count > 0 ? ` (${count})` : ""}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-[var(--spacing-20)]">
            <button
              onClick={openSearch}
              className="caption uppercase"
              aria-label="Search"
            >
              Search
            </button>
            <button
              onClick={open}
              className="caption uppercase"
              aria-label="Open cart"
            >
              Bag{count > 0 ? ` (${count})` : ""}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="caption uppercase"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-warm-parchment flex flex-col md:hidden">
          <div className="flex-1 flex flex-col justify-center px-6 gap-[var(--spacing-30)]">
            {mobileMenuItems.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-[32px] font-bold leading-none"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="px-6 py-[var(--spacing-30)] border-t border-ink-black/15">
            <p className="caption uppercase opacity-60">
              Handmade in Pakistan · Ships nationwide
            </p>
          </div>
        </div>
      )}
    </>
  );
}
