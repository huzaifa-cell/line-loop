"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import DashedCTA from "@/components/DashedCTA";

/**
 * Slide-over cart drawer (right). CHECKOUT uses the dashed-border CTA,
 * the single deliberate exception to the text-link-only rule (spec law 1).
 */
export default function CartDrawer() {
  const { isOpen, close, lines, subtotal, count, setQty, remove } = useCart();

  // Lock scroll while open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-ink-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-warm-parchment flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-6 h-14 border-b border-ink-black/15">
          <p className="caption uppercase font-bold">Your Bag ({count})</p>
          <button onClick={close} className="caption uppercase" aria-label="Close cart">
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-[var(--spacing-20)]">
            <p className="text-2xl font-bold">Your bag is empty</p>
            <p className="caption">
              Every piece is made to order. Find something worth keeping.
            </p>
            <Link
              href="/shop"
              onClick={close}
              className="caption uppercase link-underline mt-[var(--spacing-10)]"
            >
              Shop the Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-[var(--spacing-20)] divide-y divide-ink-black/15">
              {lines.map((line) => (
                <div
                  key={`${line.slug}-${line.size}-${line.colour}`}
                  className="flex gap-[var(--spacing-20)] py-[var(--spacing-20)]"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={close}
                    className="relative w-20 h-24 shrink-0 bg-ivory-mist"
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="caption font-bold">{line.name}</p>
                    <p className="caption mt-[3px]">
                      {line.colour} · {line.size}
                    </p>
                    <p className="caption mt-[3px] font-bold">
                      {formatPrice(line.price)}
                    </p>
                    <div className="mt-[var(--spacing-10)] flex items-center gap-[var(--spacing-15)]">
                      <div className="flex items-center border border-ink-black">
                        <button
                          onClick={() =>
                            setQty(line.slug, line.size, line.colour, line.qty - 1)
                          }
                          className="caption w-7 h-7 hover:bg-ink-black hover:text-warm-parchment transition-colors"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="caption w-7 text-center">{line.qty}</span>
                        <button
                          onClick={() =>
                            setQty(line.slug, line.size, line.colour, line.qty + 1)
                          }
                          className="caption w-7 h-7 hover:bg-ink-black hover:text-warm-parchment transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(line.slug, line.size, line.colour)}
                        className="caption uppercase link-underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ink-black px-6 py-[var(--spacing-20)] space-y-[var(--spacing-15)]">
              <div className="flex justify-between caption">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="caption">
                Shipping & taxes calculated at checkout. Made to order — allow
                2–3 weeks.
              </p>
              <Link href="/checkout" onClick={close}>
                <DashedCTA>Checkout</DashedCTA>
              </Link>
              <button
                onClick={close}
                className="w-full caption uppercase link-underline py-[var(--spacing-10)]"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
