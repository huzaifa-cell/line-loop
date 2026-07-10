import type { Product } from "@/lib/products";
import ProductCard from "./ProductCard";

/**
 * Flush gallery layout — 5 columns desktop, 3 tablet, 2 mobile.
 * 5px gutters, no card padding, no visual separation between images.
 */
export default function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-[5px] gap-y-[var(--spacing-30)]">
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
