"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useState } from "react";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

export function TopNavBar() {
  const { itemCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-surface-container-highest py-1.5 md:py-2 text-center">
        <span className="font-label-caps text-[10px] md:text-label-caps text-on-surface tracking-widest uppercase">
          Worldwide Express Shipping On All Orders Over $500
        </span>
      </div>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-mocha h-14 md:h-20 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-unit">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="cursor-pointer transition-all active:scale-95 flex items-center">
            <Image 
              src="/lineloop-logo.png" 
              alt="LINE&LOOP Logo" 
              width={220} 
              height={64} 
              className="h-10 md:h-16 w-auto rounded-sm"
              priority
              sizes="(max-width: 768px) 140px, 220px"
              style={{ width: "auto" }}
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
          <button onClick={openCart} className="cursor-pointer transition-all active:scale-95 hover:text-brand-red relative">
            <span className="material-symbols-outlined">shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white">
                {itemCount}
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
