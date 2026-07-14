"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useIsClient } from "@/lib/hooks";
import DashedCTA from "@/components/DashedCTA";
import EmptyState from "@/components/EmptyState";


export default function CartPage() {
  const { lines, subtotal, count, setQty, remove } = useCart();
  const mounted = useIsClient();

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">

          <EmptyState
            heading="Your bag is empty"
            body="Every piece is made to order. Find something worth keeping."
            linkHref="/shop"
            linkLabel="Shop the Collection"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-parchment py-[var(--spacing-60)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">

        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-30)]">
          Your Bag ({count})
        </h1>

        <div className="grid gap-[var(--spacing-60)] lg:grid-cols-[1fr_360px]">
          {/* Line items */}
          <div className="divide-y divide-ink-black/15">
            {lines.map((line) => (
              <div
                key={`${line.id}-${line.size}-${line.colour}`}
                className="flex gap-[var(--spacing-20)] py-[var(--spacing-20)]"
              >
                <Link
                  href={`/product/${line.id}`}
                  className="relative w-24 h-32 shrink-0 bg-ivory-mist"
                >
                  <Image
                    src={line.image}
                    alt={line.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${line.id}`}
                    className="caption font-bold link-underline"
                  >
                    {line.name}
                  </Link>
                  <p className="caption mt-[3px] opacity-70">
                    {line.colour} · {line.size}
                  </p>
                  <p className="caption mt-[3px] font-bold">
                    {formatPrice(line.price)}
                  </p>
                  <div className="mt-[var(--spacing-10)] flex items-center gap-[var(--spacing-15)]">
                    <div className="flex items-center border border-ink-black">
                      <button
                        onClick={() =>
                          setQty(line.id, line.size, line.colour, line.qty - 1)
                        }
                        className="caption w-7 h-7 hover:bg-ink-black hover:text-warm-parchment transition-colors"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="caption w-7 text-center">{line.qty}</span>
                      <button
                        onClick={() =>
                          setQty(line.id, line.size, line.colour, line.qty + 1)
                        }
                        className="caption w-7 h-7 hover:bg-ink-black hover:text-warm-parchment transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(line.id, line.size, line.colour)}
                      className="caption uppercase link-underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="caption font-bold shrink-0">
                  {formatPrice(line.price * line.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="border border-ink-black/15 p-[var(--spacing-30)] space-y-[var(--spacing-15)]">
              <p className="caption uppercase font-bold">Order Summary</p>
              <div className="flex justify-between caption">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="caption opacity-60">
                Shipping & taxes calculated at checkout.
              </p>
              <div className="stitch-line my-[var(--spacing-10)]" />
              <div className="flex justify-between caption font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout">
                <DashedCTA>Checkout</DashedCTA>
              </Link>
              <Link
                href="/shop"
                className="caption uppercase link-underline block text-center pt-[var(--spacing-10)]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

