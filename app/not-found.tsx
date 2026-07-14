import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <section className="bg-warm-parchment py-[var(--spacing-80)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <div className="text-center mb-[var(--spacing-30)]">
          <p className="caption uppercase tracking-[0.2em] text-brand-red mb-[var(--spacing-15)]">
            404
          </p>
          <h1 className="font-wordmark text-ivory-mist mix-blend-difference">
            NOT FOUND
          </h1>
        </div>
        <EmptyState
          heading="This page doesn't exist"
          body="The page you're looking for may have moved or been removed. Let's get you back on track."
          linkHref="/shop"
          linkLabel="Shop the Collection"
        />
        <div className="flex justify-center gap-[var(--spacing-30)] mt-[var(--spacing-30)]">
          <Link href="/" className="caption uppercase link-underline">
            Home
          </Link>
          <Link href="/track-order" className="caption uppercase link-underline">
            Track Order
          </Link>
        </div>
      </div>
    </section>
  );
}
