import Image from "next/image";
import Link from "next/link";

/**
 * Full-bleed dark hero — the single typographic spectacle per page.
 * "LINE&LOOP" wordmark in Fraunces (= Redaction) overlays the photograph,
 * partially intersecting the subject, edge-to-edge.
 */
export default function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full bg-ink-black overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80"
        alt="Editorial fashion — a model wearing handwoven textiles"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-black/30 via-transparent to-ink-black/60" />

      {/* Wordmark — the typographic signature */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <h1 className="font-wordmark text-ivory-mist text-center select-none mix-blend-exclusion">
          LINE&LOOP
        </h1>
      </div>

      {/* Tagline + CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] flex flex-col items-center text-center gap-[var(--spacing-20)]">
          <p className="caption uppercase tracking-[0.2em] text-ivory-mist">
            Handmade Garments · Made Slowly
          </p>
          <Link
            href="/shop"
            className="caption uppercase tracking-[0.2em] text-ivory-mist link-underline"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
