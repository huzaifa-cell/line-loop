"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { products as ALL_PRODUCTS } from "@/lib/mockData";
import { formatPrice } from "@/lib/utils";



export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Open via custom event so Nav can trigger it
  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("lineloop:search-open", onOpen);
    return () => window.removeEventListener("lineloop:search-open", onOpen);
  }, []);

  // Lock scroll + focus input when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setSubmittedQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!submittedQuery.trim()) return [];
    const q = submittedQuery.toLowerCase();
    return ALL_PRODUCTS.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.tag && p.tag.toLowerCase().includes(q)) ||
        (p.colors && p.colors.some((c) => c.name.toLowerCase().includes(q)))
    ).slice(0, 8);
  }, [submittedQuery]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSubmittedQuery("");
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink-black text-ivory-mist flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-ivory-mist/15">
        <p className="caption uppercase font-bold">Search</p>
        <button
          onClick={close}
          className="caption uppercase link-underline"
          aria-label="Close search"
        >
          Close
        </button>
      </div>

      {/* Search input — bottom-border only */}
      <div className="px-6 pt-[var(--spacing-60)]">
        <form
          className="mx-auto max-w-[640px]"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
          }}
        >
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, fabric, colour…"
            className="w-full bg-transparent border-b border-ivory-mist/30 py-[var(--spacing-15)] text-2xl font-bold text-ivory-mist outline-none placeholder:text-ivory-mist/30 focus:border-[var(--color-brand-red)]"
            aria-label="Search products"
          />
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pt-[var(--spacing-30)] pb-[var(--spacing-60)]">
        <div className="mx-auto max-w-[640px] divide-y divide-ivory-mist/10">
          {submittedQuery.trim() && results.length === 0 && (
            <p className="caption opacity-50 py-[var(--spacing-30)] text-center">
              No pieces found. Try a different search.
            </p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              onClick={close}
              className="flex items-center gap-[var(--spacing-20)] py-[var(--spacing-15)] hover:opacity-70 transition-opacity"
            >
              <div className="relative w-14 h-16 shrink-0 bg-ivory-mist/10">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="caption uppercase opacity-60">{p.category}</p>
                <p className="caption font-bold truncate">{p.name}</p>
              </div>
              <p className="caption font-bold shrink-0">
                {formatPrice(p.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
