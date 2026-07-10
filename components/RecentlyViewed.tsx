"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useLocalStorage } from "@/lib/hooks";

const STORAGE_KEY = "lineloop-recently-viewed";
const MAX_ITEMS = 6;

/**
 * Recently-viewed rail — reads from localStorage. Tracks product slugs as the
 * user visits PDPs, deduplicates, and shows the most recent first.
 * Client-only; renders nothing on SSR or if empty.
 */
export default function RecentlyViewed({
  currentSlug,
  products,
}: {
  currentSlug?: string;
  products: Product[];
}) {
  const [slugs, setSlugs] = useLocalStorage<string[]>(STORAGE_KEY, []);
  const pathname = usePathname();

  // Write current slug to localStorage on PDP visit
  useEffect(() => {
    if (!currentSlug) return;
    setSlugs((prev) => {
      const filtered = prev.filter((s) => s !== currentSlug);
      return [currentSlug, ...filtered].slice(0, MAX_ITEMS);
    });
  }, [currentSlug, pathname, setSlugs]);

  const recent = (currentSlug ? slugs.filter((s) => s !== currentSlug) : slugs)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);

  if (recent.length === 0) return null;

  return (
    <section className="bg-ivory-mist py-[var(--spacing-60)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <h2 className="text-[24px] font-bold leading-none mb-[var(--spacing-30)]">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-[5px] gap-y-[var(--spacing-20)]">
          {recent.map((p) => (
            <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] bg-warm-parchment overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                />
              </div>
              <p className="caption mt-[var(--spacing-10)] truncate">{p.name}</p>
              <p className="caption font-bold">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
