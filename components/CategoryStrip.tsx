import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/products";

/**
 * Category navigation — four flush tiles, each linking to the shop filtered
 * by category. Kept as text-link-only within each tile.
 */
const categoryImage: Record<string, string> = {
  "Kurtis & Tops":
    "https://images.unsplash.com/photo-1583391733981-3d1c0e9a8d9e?auto=format&fit=crop&w=600&q=80",
  "Shalwar Kameez":
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
  "Trousers & Bottoms":
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
  "Dupattas & Stoles":
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=80",
};

export default function CategoryStrip() {
  return (
    <section className="bg-warm-parchment py-[var(--spacing-80)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <div className="flex items-end justify-between mb-[var(--spacing-30)]">
          <h2 className="text-[32px] font-bold leading-none">Shop by Category</h2>
          <Link href="/shop" className="caption uppercase link-underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[5px]">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="group relative aspect-[3/4] overflow-hidden bg-ivory-mist"
            >
              <Image
                src={categoryImage[cat]}
                alt={cat}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-ink-black/15" />
              <div className="absolute bottom-0 left-0 right-0 p-[var(--spacing-20)]">
                <p className="caption uppercase font-bold text-ivory-mist">
                  {cat}
                </p>
                <div className="stitch-line--accent mt-[6px] w-10" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
