import type { Metadata } from "next";
import { getStorefrontProducts } from "@/lib/storefront";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  // Fetch all products so the client can filter by the saved slugs
  const products = await getStorefrontProducts();

  return (
    <section className="bg-warm-parchment py-[var(--spacing-30)] min-h-[60vh]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-10)]">
          My Wishlist
        </h1>
        <p className="caption opacity-60 mb-[var(--spacing-40)]">
          Pieces you've saved for later.
        </p>

        <WishlistClient products={products} />
      </div>
    </section>
  );
}
