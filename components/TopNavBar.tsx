"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useState } from "react";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

export function TopNavBar() {
  const { count, open } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-mocha min-h-[60px] md:min-h-[72px] py-1.5 md:py-2 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="cursor-pointer transition-all active:scale-95 flex items-center">
            <Image 
              src="/lineloop-logo.png" 
              alt="LINE&LOOP Logo" 
              width={240} 
              height={80} 
              className="w-[150px] md:w-[180px] h-auto"
              priority
              sizes="(max-width: 768px) 150px, 180px"
            />
          </Link>
          <nav className="hidden md:flex gap-8 items-center h-full">
            <Link href="/shop" className="font-label-caps text-label-caps text-on-surface hover:text-brand-red transition-colors duration-300 py-1 cursor-pointer">
              SHOP
            </Link>
            <Link href="/about" className="font-label-caps text-label-caps text-on-surface hover:text-brand-red transition-colors duration-300 py-1 cursor-pointer">
              ABOUT
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            className="cursor-pointer transition-all active:scale-95 hover:text-brand-red"
            onClick={() => window.dispatchEvent(new CustomEvent("lineloop:search-open"))}
            aria-label="Open search"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link href="/wishlist" className="cursor-pointer transition-all active:scale-95 hover:text-brand-red relative" aria-label="Open wishlist">
            <span className="material-symbols-outlined">favorite</span>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <button onClick={open} className="cursor-pointer transition-all active:scale-95 hover:text-brand-red relative">
            <span className="material-symbols-outlined">shopping_bag</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                {count}
              </span>
            )}
          </button>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-mocha px-margin-mobile py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-label-caps text-label-caps text-on-surface hover:text-brand-red transition-colors"
            >
              {item.label.toUpperCase()}
            </Link>
          ))}
          <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface hover:text-brand-red transition-colors">
            TRACK ORDER
          </Link>
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="font-label-caps text-label-caps text-on-surface hover:text-brand-red transition-colors">
            ACCOUNT
          </Link>
        </div>
      )}
    </>
  );
}
