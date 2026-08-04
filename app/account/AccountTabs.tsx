"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";

const TABS = ["ORDERS", "WISHLIST", "DETAILS"] as const;
type Tab = (typeof TABS)[number];

interface OrderSummary {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  lineCount: number;
}

export default function AccountTabs({
  orders,
  products,
  userEmail,
  firstName,
  lastName,
}: {
  orders: OrderSummary[];
  products: any[];
  userEmail: string;
  firstName: string;
  lastName: string;
}) {
  const [tab, setTab] = useState<Tab>("ORDERS");
  const { items: wishlist } = useWishlist();

  const wishlistProducts = wishlist
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div>
      {/* Tab nav — text tabs, active = red underline */}
      <div className="flex border-b border-ink-black/15 mb-[var(--spacing-30)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "caption uppercase py-[var(--spacing-15)] px-[var(--spacing-20)] transition-colors",
              tab === t
                ? "font-bold border-b border-[var(--color-brand-red)]"
                : "opacity-50"
            )}
          >
            {t}
            {t === "WISHLIST" && wishlist.length > 0 && ` (${wishlist.length})`}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === "ORDERS" && (
        <div className="space-y-[var(--spacing-15)]">
          {orders.length === 0 ? (
            <p className="caption opacity-60">
              No orders yet. Start shopping to see your order history here.
            </p>
          ) : (
            orders.map((o) => (
              <Link
                key={o.orderNumber}
                href={`/track-order?order=${o.orderNumber}&email=${encodeURIComponent(userEmail)}`}
                className="block border border-ink-black/15 p-[var(--spacing-20)] hover:border-ink-black/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="caption font-bold">{o.orderNumber}</p>
                    <p className="caption opacity-60 mt-[3px]">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {o.lineCount} {o.lineCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="caption font-bold">{formatPrice(o.total)}</p>
                    <p className="caption uppercase text-brand-red mt-[3px]">
                      {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {tab === "WISHLIST" && (
        <div>
          {wishlistProducts.length === 0 ? (
            <p className="caption opacity-60">
              Your wishlist is empty. Save pieces you love by tapping{" "}
              <span className="font-bold">Save</span> on any product.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[5px] gap-y-[var(--spacing-20)]">
              {wishlistProducts.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] bg-ivory-mist overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                    />
                  </div>
                  <p className="caption mt-[var(--spacing-10)] truncate">{p.name}</p>
                  <p className="caption font-bold">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details tab */}
      {tab === "DETAILS" && (
        <div className="max-w-[440px] space-y-[var(--spacing-20)]">
          <div>
            <p className="caption uppercase opacity-60 mb-[5px]">Name</p>
            <p className="caption font-bold">
              {firstName} {lastName}
            </p>
          </div>
          <div>
            <p className="caption uppercase opacity-60 mb-[5px]">Email</p>
            <p className="caption font-bold">{userEmail}</p>
          </div>
          <p className="caption opacity-60 mt-[var(--spacing-20)]">
            To update your details, use the profile settings in your account menu.
          </p>
        </div>
      )}
    </div>
  );
}
