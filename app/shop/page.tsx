import type { Metadata } from "next";
import { Suspense } from "react";
import ProductGrid from "@/components/ProductGrid";
import Filters from "@/components/shop/Filters";
import {
  getByCategory,
  type Category,
  PRICE_RANGES,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — The Collection",
  description:
    "Handmade ladies' garments — kurtis, shalwar kameez, trousers and dupattas. Made to order in small batches in Pakistan.",
};

type SearchParams = Promise<{
  category?: string;
  sort?: string;
  size?: string;
  color?: string;
  price?: string;
  rating?: string;
}>;

function select(
  category: string | undefined,
  sort: string | undefined,
  size: string | undefined,
  color: string | undefined,
  price: string | undefined,
  rating: string | undefined
) {
  let list = getByCategory((category as Category | "All") || "All");

  // Size filter
  if (size) list = list.filter((p) => p.sizes.includes(size));

  // Color filter
  if (color) list = list.filter((p) => p.colours.includes(color));

  // Price range filter
  if (price) {
    const range = PRICE_RANGES.find((r) => r.label === price);
    if (range) {
      list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    }
  }

  // Rating filter
  if (rating) {
    const minRating = parseFloat(rating);
    if (!isNaN(minRating)) {
      list = list.filter((p) => p.rating >= minRating);
    }
  }

  // Sort
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return list;
}

/** Skeleton grid — gray rectangles, 0-radius, no shimmer (spec §4). */
function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[5px]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-ink-black/10" />
          <div className="pt-[var(--spacing-15)] space-y-[5px]">
            <div className="h-[10px] w-16 bg-ink-black/10" />
            <div className="h-[10px] w-24 bg-ink-black/10" />
            <div className="h-[10px] w-12 bg-ink-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Shop({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, sort, size, color, price, rating } = await searchParams;
  const list = select(category, sort, size, color, price, rating);

  return (
    <>
      <section className="bg-warm-parchment pt-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <p className="caption uppercase tracking-[0.2em] mb-[var(--spacing-15)]">
            The Collection
          </p>
          <h1 className="font-wordmark text-ivory-mist mix-blend-difference text-left">
            SHOP
          </h1>
        </div>
      </section>

      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <div className="grid gap-[var(--spacing-60)] lg:grid-cols-[200px_1fr]">
            {/* Sidebar filters */}
            <Suspense
              fallback={
                <div className="space-y-[var(--spacing-30)]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[40px] bg-ink-black/5" />
                  ))}
                </div>
              }
            >
              <Filters />
            </Suspense>

            {/* Product grid */}
            <div>
              <div className="flex items-center justify-between mb-[var(--spacing-30)]">
                <p className="caption uppercase opacity-60">
                  {list.length} {list.length === 1 ? "piece" : "pieces"}
                </p>
              </div>

              <Suspense fallback={<SkeletonGrid />}>
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-[var(--spacing-80)] text-center">
                    <h2 className="text-[24px] font-bold leading-none">
                      No pieces found
                    </h2>
                    <p className="text-base leading-[1.8] mt-[var(--spacing-20)]">
                      Try adjusting your filters or clearing them.
                    </p>
                  </div>
                ) : (
                  <ProductGrid products={list} priorityCount={4} />
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
