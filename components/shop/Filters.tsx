"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  CATEGORIES,
  getAllColors,
  getAllSizes,
  PRICE_RANGES,
  type Category,
} from "@/lib/products";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Best Rated" },
];

const RATINGS = [4, 3, 2, 1];

/**
 * Collapsible filter section — plain text header with +/– toggle,
 * no chevrons, no icons.
 */
function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-black/15 pb-[var(--spacing-20)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between caption uppercase font-bold text-left"
        aria-expanded={open}
      >
        {title}
        <span className="text-base font-normal leading-none select-none">
          {open ? "–" : "+"}
        </span>
      </button>
      {open && (
        <div className="mt-[var(--spacing-15)] flex flex-col gap-[var(--spacing-10)]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Filters() {
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCategory =
    (params.get("category") as Category | "All") || "All";
  const activeSize = params.get("size") || "";
  const activeColor = params.get("color") || "";
  const activePriceRange = params.get("price") || "";
  const activeRating = params.get("rating") || "";
  const activeSort = (params.get("sort") as SortKey) || "featured";

  const activeFilterCount = [
    activeCategory !== "All" ? 1 : 0,
    activeSize ? 1 : 0,
    activeColor ? 1 : 0,
    activePriceRange ? 1 : 0,
    activeRating ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "featured" && value !== "All") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      const qs = next.toString();
      router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    },
    [params, router]
  );

  const sizes = getAllSizes();
  const colors = getAllColors();

  const filterContent = (
    <>
      {/* Sort — top of sidebar */}
      <div>
        <p className="caption uppercase font-bold mb-[var(--spacing-10)]">
          Sort By
        </p>
        <div className="flex flex-wrap gap-x-[var(--spacing-15)] gap-y-[var(--spacing-10)]">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setParam("sort", s.key)}
              className={cn(
                "caption",
                activeSort === s.key ? "font-bold" : "link-underline"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <button
          onClick={() => setParam("category", "All")}
          className={cn(
            "caption uppercase text-left",
            activeCategory === "All" ? "font-bold" : "link-underline"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam("category", cat)}
            className={cn(
              "caption uppercase text-left",
              activeCategory === cat ? "font-bold" : "link-underline"
            )}
          >
            {cat}
          </button>
        ))}
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => setParam("size", activeSize === s ? "" : s)}
            className={cn(
              "caption uppercase text-left",
              activeSize === s ? "font-bold" : "link-underline"
            )}
          >
            {s}
          </button>
        ))}
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setParam("color", activeColor === c ? "" : c)}
            className={cn(
              "caption text-left",
              activeColor === c ? "font-bold" : "link-underline"
            )}
          >
            {c}
          </button>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price" defaultOpen={false}>
        {PRICE_RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() =>
              setParam("price", activePriceRange === r.label ? "" : r.label)
            }
            className={cn(
              "caption text-left",
              activePriceRange === r.label ? "font-bold" : "link-underline"
            )}
          >
            {r.label}
          </button>
        ))}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" defaultOpen={false}>
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() =>
              setParam("rating", activeRating === String(r) ? "" : String(r))
            }
            className={cn(
              "caption text-left",
              activeRating === String(r) ? "font-bold" : "link-underline"
            )}
          >
            {r}★ &amp; up
          </button>
        ))}
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden caption uppercase font-bold w-full flex items-center justify-between py-[var(--spacing-15)] border-b border-ink-black/15"
        aria-expanded={mobileOpen}
      >
        Filters
        <span>
          {mobileOpen ? "–" : "+"}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </span>
      </button>

      {/* Mobile collapsible */}
      {mobileOpen && (
        <div className="lg:hidden flex flex-col gap-[var(--spacing-20)] pb-[var(--spacing-30)]">
          {filterContent}
        </div>
      )}

      {/* Desktop always visible */}
      <aside
        className="hidden lg:flex flex-col gap-[var(--spacing-20)]"
        aria-label="Filters"
      >
        {filterContent}
      </aside>
    </>
  );
}
