"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import DashedCTA from "@/components/DashedCTA";

/**
 * Client-side interactions for the product page — size & colour selection
 * and the add-to-cart action. ADD TO BAG uses the dashed-border CTA, the
 * single deliberate exception to the text-link-only rule (spec law 1).
 */
export default function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0]);
  const [colour, setColour] = useState(product.colours[0]);

  const selectedVariant = product.variants.find(
    (v) => v.size === size && v.color === colour
  );

  return (
    <div>
      <p className="caption uppercase font-bold mt-[var(--spacing-20)]">
        {formatPrice(product.price)}
        {product.soldOut && (
          <span className="ml-[var(--spacing-10)] text-brand-red">Sold Out</span>
        )}
      </p>

      {/* Colour */}
      <div className="mt-[var(--spacing-30)]">
        <p className="caption uppercase opacity-60 mb-[var(--spacing-10)]">
          Colour — <span className="font-bold opacity-100">{colour}</span>
        </p>
        <div className="flex flex-wrap gap-[var(--spacing-10)]">
          {product.colours.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              className={cn(
                "caption uppercase border border-ink-black px-[var(--spacing-15)] py-[8px] transition-colors",
                colour === c
                  ? "bg-ink-black text-warm-parchment"
                  : "bg-transparent hover:bg-ink-black/5"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-[var(--spacing-20)]">
        <p className="caption uppercase opacity-60 mb-[var(--spacing-10)]">
          Size — <span className="font-bold opacity-100">{size}</span>
        </p>
        <div className="flex flex-wrap gap-[var(--spacing-10)]">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "caption uppercase border border-ink-black px-[var(--spacing-15)] py-[8px] transition-colors",
                size === s
                  ? "bg-ink-black text-warm-parchment"
                  : "bg-transparent hover:bg-ink-black/5"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Add to cart */}
      <div className="mt-[var(--spacing-30)]">
        <DashedCTA
          disabled={product.soldOut}
          onClick={() => add(product, size, colour, 1, selectedVariant?.id)}
        >
          {product.soldOut ? "Sold Out" : "Add to Bag"}
        </DashedCTA>
      </div>
    </div>
  );
}
