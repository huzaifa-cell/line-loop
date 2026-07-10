import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — The Craft",
  description:
    "How LINE&LOOP garments are made — hand-dyed, block-printed, and tailored by hand in small batches with making families across Pakistan.",
};

const steps = [
  {
    n: "01",
    title: "Source",
    body: "Raw cotton, mulberry silk and lawn, bought directly from mill co-operatives. No synthetics, no middlemen.",
  },
  {
    n: "02",
    title: "Dye & Print",
    body: "Yarn and cloth are hand-dyed or block-printed with carved teak blocks — a single suit can move through sixteen dye stages.",
  },
  {
    n: "03",
    title: "Tailor",
    body: "Cut and stitched by hand at our Lahore atelier. French seams, natural-fibre thread, no factory shortcuts.",
  },
  {
    n: "04",
    title: "Finish",
    body: "Pressed, checked, and wrapped by hand. Made to order, so nothing is wasted and nothing is overproduced.",
  },
];

const artisans = [
  {
    name: "The Khatri Block-Printers",
    place: "Sindh",
    craft: "Hand block-print & Ajrakh",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "The Lucknow Chikankari Collective",
    place: "Lucknow",
    craft: "Shadow-work hand embroidery",
    image:
      "https://images.unsplash.com/photo-1583391733981-3d1c0e9a8d9e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "The LINE&LOOP Atelier",
    place: "Lahore",
    craft: "Cutting, tailoring & finish",
    image:
      "https://images.unsplash.com/photo-1599391443912-70916ab4f977?auto=format&fit=crop&w=600&q=80",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[440px] w-full bg-ink-black overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80"
          alt="Hands block-printing cloth by hand"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-black/30 via-transparent to-ink-black/70" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="font-wordmark text-ivory-mist text-center select-none mix-blend-exclusion">
            MADE BY HAND
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="bg-warm-parchment py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[680px] px-6 text-center">
          <p className="caption uppercase tracking-[0.2em] mb-[var(--spacing-20)]">
            Our Story
          </p>
          <p className="text-base leading-[1.8]">
            LINE&LOOP began as a refusal of the disposable. We make handmade
            ladies&rsquo; garments slowly &mdash; hand-dyed, block-printed, and
            tailored by people we know by name. We work with making families
            across Pakistan in tiny, fair-paid batches, because the hands behind
            a cloth are part of its value. Every piece carries the slight
            imperfections of the human who made it. That, to us, is the whole
            point.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="bg-ivory-mist py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <h2 className="text-[32px] font-bold leading-none mb-[var(--spacing-60)]">
            How a Piece is Made
          </h2>
          <div className="grid gap-[5px] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="bg-warm-parchment p-[var(--spacing-30)]">
                <p className="caption uppercase font-bold">{s.n}</p>
                <div className="stitch-line w-8 my-[var(--spacing-15)]" />
                <h3 className="text-[24px] font-bold leading-none">
                  {s.title}
                </h3>
                <p className="text-base leading-[1.7] mt-[var(--spacing-15)]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans */}
      <section className="bg-warm-parchment py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <h2 className="text-[32px] font-bold leading-none mb-[var(--spacing-30)]">
            The Makers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[5px]">
            {artisans.map((a) => (
              <div key={a.name}>
                <div className="relative aspect-[4/5] bg-ivory-mist">
                  <Image
                    src={a.image}
                    alt={`${a.name}, ${a.place}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <p className="caption font-bold uppercase mt-[var(--spacing-15)]">
                  {a.name}
                </p>
                <p className="caption opacity-70">
                  {a.craft} · {a.place}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability / care */}
      <section id="care" className="bg-ivory-mist py-[var(--spacing-80)]">
        <div className="mx-auto max-w-[680px] px-6 text-center">
          <p className="caption uppercase tracking-[0.2em] mb-[var(--spacing-20)]">
            Care &amp; Conscience
          </p>
          <p className="text-base leading-[1.8]">
            Natural dyes fade gently with time and light &mdash; that is
            character, not wear. Hand wash cold, dry in shade, iron on reverse
            where embroidered. We repair what we make, for as long as you wear it.
          </p>
          <Link
            href="/shop"
            className="caption uppercase link-underline inline-block mt-[var(--spacing-30)]"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
