"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useLocalStorage } from "@/lib/hooks";

const WISHLIST_KEY = "lineloop-wishlist";

/**
 * Grid item in the product gallery.
 * Zero radius, no card border, no shadow — the image IS the card.
 * Sold Out: red text + dashed strikethrough.
 * Hover: crossfade to second angle (200ms).
 * Save/Saved: plain text toggle, not a heart icon.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const secondImage = product.images.length > 1 ? product.images[1].url : null;
  const [hovered, setHovered] = useState(false);
  const [wishlist, setWishlist] = useLocalStorage<string[]>(WISHLIST_KEY, []);
  const saved = wishlist.includes(product.slug);

  const toggleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setWishlist((prev) =>
        saved
          ? prev.filter((s) => s !== product.slug)
          : [...prev, product.slug]
      );
    },
    [product.slug, saved, setWishlist]
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] bg-ivory-mist overflow-hidden">
        {/* Primary image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover transition-opacity duration-200 ${
            hovered && secondImage ? "opacity-0" : "opacity-100"
          }`}
          priority={priority}
        />
        {/* Second angle on hover (crossfade) */}
        {secondImage && (
          <Image
            src={secondImage}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover transition-opacity duration-200 absolute inset-0 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {/* Save/Saved toggle — plain text, top-right */}
        <button
          onClick={toggleSave}
          className="absolute top-[var(--spacing-10)] right-[var(--spacing-10)] caption uppercase link-underline"
          aria-label={saved ? "Remove from saved items" : "Save for later"}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="pt-[var(--spacing-15)]">
        <p className="caption font-bold uppercase">{product.category}</p>
        <p className="caption mt-[5px]">{product.name}</p>
        <p className="caption mt-[5px] font-bold">
          {product.compareAtPrice && (
            <span className="opacity-40 line-through mr-[var(--spacing-10)]">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          {formatPrice(product.price)}
          {product.soldOut && (
            <span className="ml-[var(--spacing-10)] text-brand-red">
              Sold Out
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
