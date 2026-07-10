"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import DashedCTA from "@/components/DashedCTA";
import { LOW_STOCK_THRESHOLD } from "@/lib/products";

interface ClientProduct {
  slug: string;
  name: string;
  price: number;
  soldOut: boolean;
  colours: string[];
  sizes: string[];
  images: string[];
  variants: {
    id: string;
    size: string;
    color: string;
    sku: string;
    inventoryCount: number;
    priceOverride?: number;
  }[];
  category: string;
}

/**
 * Client-side PDP actions — colour selection, size selector with stock
 * urgency, size guide modal, and Add to Bag dashed CTA.
 *
 * Size selector: underlined rows, selected = bold + red underline.
 * "Only N left" shown inline when inventoryCount ≤ LOW_STOCK_THRESHOLD.
 */
export default function ProductDetailActions({
  product,
}: {
  product: ClientProduct;
}) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0]);
  const [colour, setColour] = useState(product.colours[0]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Get inventory for the selected size
  const selectedVariant = product.variants.find(
    (v) => v.size === size && v.color === colour
  );
  const stock = selectedVariant?.inventoryCount ?? 0;
  const isSizeAvailable = stock > 0;
  const price = selectedVariant?.priceOverride ?? product.price;

  // Determine unique sizes available for the selected colour
  const sizesForColour = product.sizes; // all sizes listed for now; could filter by colour-specific variants

  return (
    <div>
      {/* Price */}
      <p className="caption uppercase font-bold mt-[var(--spacing-20)]">
        {formatPrice(price)}
        {product.soldOut && (
          <span className="ml-[var(--spacing-10)] text-brand-red">
            Sold Out
          </span>
        )}
      </p>

      {/* Colour */}
      <div className="mt-[var(--spacing-30)]">
        <p className="caption uppercase opacity-60 mb-[var(--spacing-10)]">
          Colour —{" "}
          <span className="font-bold opacity-100">{colour}</span>
        </p>
        <div className="flex flex-wrap gap-[var(--spacing-10)]">
          {product.colours.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              className={`caption uppercase border border-ink-black px-[var(--spacing-15)] py-[8px] transition-colors ${
                colour === c
                  ? "bg-ink-black text-warm-parchment"
                  : "bg-transparent hover:bg-ink-black/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size — underlined rows, selected = bold + red underline */}
      <div className="mt-[var(--spacing-20)]">
        <div className="flex items-center justify-between mb-[var(--spacing-10)]">
          <p className="caption uppercase opacity-60">
            Size —{" "}
            <span className="font-bold opacity-100">{size}</span>
          </p>
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="caption link-underline"
          >
            Size Guide
          </button>
        </div>
        <div className="flex flex-col">
          {sizesForColour.map((s) => {
            const variantStock = product.variants.find(
              (v) => v.size === s && v.color === colour
            )?.inventoryCount ?? 0;
            const available = variantStock > 0;
            return (
              <button
                key={s}
                onClick={() => available && setSize(s)}
                disabled={!available}
                className={`caption uppercase flex items-center justify-between py-[var(--spacing-10)] border-b transition-colors ${
                  size === s
                    ? "font-bold border-[var(--color-brand-red)]"
                    : "border-ink-black/15 hover:border-ink-black"
                } ${!available ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span>{s}</span>
                {!available && (
                  <span className="text-brand-red text-[10px]">Sold Out</span>
                )}
                {available && variantStock <= LOW_STOCK_THRESHOLD && (
                  <span className="text-brand-red text-[10px]">
                    Only {variantStock} left
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add to Bag */}
      <div className="mt-[var(--spacing-30)]">
        <DashedCTA
          disabled={product.soldOut || !isSizeAvailable}
          onClick={() =>
            add(
              {
                slug: product.slug,
                name: product.name,
                price,
                image: product.images[0],
                image2: product.images[0],
                colours: product.colours,
                sizes: product.sizes,
                variants: product.variants,
              } as unknown as Parameters<typeof add>[0],
              size,
              colour,
              1,
              selectedVariant?.id
            )
          }
        >
          {product.soldOut || !isSizeAvailable ? "Sold Out" : "Add to Bag"}
        </DashedCTA>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSizeGuideOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink-black/40 transition-opacity" />
          {/* Panel */}
          <div
            className="relative bg-warm-parchment w-full max-w-lg max-h-[80vh] overflow-y-auto p-[var(--spacing-60)] mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Size Guide"
          >
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-[var(--spacing-20)] right-[var(--spacing-20)] caption uppercase"
            >
              Close
            </button>
            <h2 className="text-[24px] font-bold leading-none mb-[var(--spacing-30)]">
              Size Guide
            </h2>
            <table className="w-full caption border-b border-ink-black/15">
              <thead>
                <tr className="border-b border-ink-black/15">
                  <th className="text-left py-[var(--spacing-15)] font-bold uppercase">
                    Size
                  </th>
                  <th className="text-left py-[var(--spacing-15)] font-bold uppercase">
                    Bust (in)
                  </th>
                  <th className="text-left py-[var(--spacing-15)] font-bold uppercase">
                    Waist (in)
                  </th>
                  <th className="text-left py-[var(--spacing-15)] font-bold uppercase">
                    Hip (in)
                  </th>
                  <th className="text-left py-[var(--spacing-15)] font-bold uppercase">
                    Length (in)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["XS", "32–33", "25–26", "35–36", "38"],
                  ["S", "34–35", "27–28", "37–38", "39"],
                  ["M", "36–37", "29–30", "39–40", "40"],
                  ["L", "38–40", "31–33", "41–43", "41"],
                  ["XL", "42–44", "34–36", "44–46", "42"],
                ].map(([sz, bust, waist, hip, length]) => (
                  <tr
                    key={sz}
                    className="border-b border-ink-black/10"
                  >
                    <td className="py-[var(--spacing-10)] font-bold">
                      {sz}
                    </td>
                    <td className="py-[var(--spacing-10)]">{bust}</td>
                    <td className="py-[var(--spacing-10)]">{waist}</td>
                    <td className="py-[var(--spacing-10)]">{hip}</td>
                    <td className="py-[var(--spacing-10)]">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-[var(--spacing-30)] text-base leading-[1.8] opacity-70">
              Measurements are body measurements in inches. If you are between
              sizes, size up for a relaxed fit or down for a closer one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
