"use client";

import { useWishlist } from "@/lib/wishlist";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { Product } from "@/lib/types";

export default function WishlistClient({ products }: { products: Product[] }) {
  const { items, isLoaded } = useWishlist();

  if (!isLoaded) {
    return <div className="caption opacity-60">Loading...</div>;
  }

  const wishlistProducts = items
    .map((id) => products.find((p) => p.id === id || (p as any).slug === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  if (wishlistProducts.length === 0) {
    return (
      <EmptyState
        heading="Your wishlist is empty"
        body="Save pieces you love by tapping the heart icon on any product."
        linkHref="/shop"
        linkLabel="Explore the Collection"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[5px] gap-y-[var(--spacing-20)]">
      {wishlistProducts.map((p) => (
        <Link key={p.id} href={`/shop/${p.id}`} className="group block">
          <div className="relative aspect-[4/5] bg-ivory-mist overflow-hidden rounded-md">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <p className="caption mt-[var(--spacing-10)] truncate group-hover:text-brand-red transition-colors">{p.name}</p>
          <p className="caption font-bold">{formatPrice(p.price)}</p>
        </Link>
      ))}
    </div>
  );
}
