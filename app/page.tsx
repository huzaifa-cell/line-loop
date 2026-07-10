import Hero from "@/components/Hero";
import IntroText from "@/components/IntroText";
import ProductGrid from "@/components/ProductGrid";
import CategoryStrip from "@/components/CategoryStrip";
import CraftTeaser from "@/components/CraftTeaser";
import RecentlyViewed from "@/components/RecentlyViewed";
import { getFeatured, products } from "@/lib/products";

export default function Home() {
  const featured = getFeatured();
  return (
    <>
      <Hero />
      <IntroText />

      <section className="bg-warm-parchment py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <div className="flex items-end justify-between mb-[var(--spacing-30)]">
            <h2 className="text-[32px] font-bold leading-none">New & Selected</h2>
          </div>
          <ProductGrid products={featured} priorityCount={5} />
        </div>
      </section>

      <CategoryStrip />
      <CraftTeaser />
      <RecentlyViewed products={products} />
    </>
  );
}
