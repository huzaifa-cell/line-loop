import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGrid from "@/components/ProductGrid";
import Accordion from "@/components/Accordion";
import StitchDivider from "@/components/StitchDivider";
import RecentlyViewed from "@/components/RecentlyViewed";
import ReviewForm, { Stars } from "@/components/ReviewForm";
import {
  getProduct,
  getRelated,
  products,
} from "@/lib/products";
import { getReviewsForProduct, getRatingStats } from "@/lib/reviews";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelated(slug);
  const reviews = await getReviewsForProduct(slug);
  const ratingStats = await getRatingStats(slug);

  // Serialize product data for the client component (not the full variant array).
  // Only the fields the client needs: slug, name, price, soldOut, colours, sizes, images.
  const clientProduct = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    soldOut: product.soldOut ?? false,
    colours: product.colours,
    sizes: product.sizes,
    images: product.images.map((img) => img.url),
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      inventoryCount: v.inventoryCount,
      priceOverride: v.priceOverride,
    })),
    category: product.category,
  };

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-warm-parchment pt-[var(--spacing-30)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <Breadcrumb
            items={[
              { label: "Shop", href: "/shop" },
              {
                label: product.category,
                href: `/shop?category=${encodeURIComponent(product.category)}`,
              },
              { label: product.name },
            ]}
          />
        </div>
      </section>

      {/* Main PDP — 2-col */}
      <section className="bg-warm-parchment py-[var(--spacing-30)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6 grid md:grid-cols-2 gap-x-[var(--spacing-60)] gap-y-[var(--spacing-30)]">
          {/* Gallery — vertical image stack */}
          <div className="flex flex-col gap-[5px]">
            {product.images.map((img, i) => (
              <div
                key={img.url}
                className={`relative bg-ivory-mist ${
                  i === 0 ? "aspect-[4/5]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || product.name}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Info — sticky on desktop */}
          <div className="md:sticky md:top-20 md:self-start">
            <p className="caption uppercase font-bold">
              {product.category}
            </p>
            <h1 className="text-[32px] font-bold leading-[1.15] mt-[var(--spacing-10)]">
              {product.name}
            </h1>

            {/* Rating */}
            <p className="caption mt-[var(--spacing-10)]">
              {product.rating} · {product.reviewCount} reviews
            </p>

            <ProductDetailActions product={clientProduct} />

            <div className="mt-[var(--spacing-60)]">
              <p className="text-base leading-[1.8]">{product.description}</p>
            </div>

            {/* Detail metadata */}
            <StitchDivider className="my-[var(--spacing-30)]" />
            <dl className="grid grid-cols-[110px_1fr] gap-[var(--spacing-15)]">
              <dt className="caption uppercase opacity-60">Fabric</dt>
              <dd className="caption">{product.fabricComposition}</dd>
              <dt className="caption uppercase opacity-60">Care</dt>
              <dd className="caption">{product.careInstructions}</dd>
              <dt className="caption uppercase opacity-60">Fit</dt>
              <dd className="caption">{product.fitNotes}</dd>
              <dt className="caption uppercase opacity-60">Maker</dt>
              <dd className="caption">{product.artisan}</dd>
            </dl>

            {/* Accordions */}
            <div className="mt-[var(--spacing-30)]">
              <Accordion title="Fabric & Care">
                <p>{product.fabricComposition}</p>
                <p className="mt-[var(--spacing-10)]">{product.careInstructions}</p>
              </Accordion>
              <Accordion title="Fit Notes" defaultOpen={false}>
                <p>{product.fitNotes}</p>
              </Accordion>
              <Accordion title="Shipping & Returns" defaultOpen={false}>
                <p>
                  Made to order. Allow 7–10 working days for dispatch. Free
                  shipping on orders over Rs 10,000. We accept returns within 14
                  days of delivery — unworn, tags attached.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section */}
      <section className="bg-ivory-mist py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <div className="grid lg:grid-cols-[1fr_440px] gap-[var(--spacing-60)]">
            {/* Review list */}
            <div>
              <h2 className="text-[24px] font-bold leading-none mb-[var(--spacing-15)]">
                Reviews
              </h2>
              {ratingStats.reviewCount > 0 ? (
                <div className="flex items-center gap-[var(--spacing-15)] mb-[var(--spacing-30)]">
                  <Stars value={Math.round(ratingStats.avgRating)} />
                  <p className="caption">
                    {ratingStats.avgRating} · {ratingStats.reviewCount}{" "}
                    {ratingStats.reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              ) : (
                <p className="caption opacity-60 mb-[var(--spacing-30)]">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}

              <div className="space-y-[var(--spacing-30)]">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-ink-black/15 pb-[var(--spacing-20)]">
                    <div className="flex items-center justify-between mb-[var(--spacing-10)]">
                      <p className="caption font-bold">{review.authorName}</p>
                      {review.verified && (
                        <span className="caption uppercase text-brand-red">
                          Verified
                        </span>
                      )}
                    </div>
                    <Stars value={review.rating} />
                    <p className="caption font-bold mt-[var(--spacing-10)]">
                      {review.title}
                    </p>
                    <p className="text-base leading-[1.8] mt-[var(--spacing-10)]">
                      {review.body}
                    </p>
                    <p className="caption opacity-50 mt-[var(--spacing-10)]">
                      {new Date(review.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Review form */}
            <div>
              <ReviewForm productSlug={slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Related products rail */}
      <section className="bg-warm-parchment py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <h2 className="text-[24px] font-bold leading-none mb-[var(--spacing-30)]">
            You May Also Like
          </h2>
          <ProductGrid products={related} />
        </div>
      </section>

      {/* Recently viewed rail */}
      <RecentlyViewed currentSlug={slug} products={products} />
    </>
  );
}
