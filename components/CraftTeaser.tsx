import Image from "next/image";
import Link from "next/link";

/**
 * Split section on warm parchment — a full-bleed craft image beside a
 * short story column, linking through to the About / craft page.
 */
export default function CraftTeaser() {
  return (
    <section className="bg-warm-parchment py-[var(--spacing-80)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <div className="grid md:grid-cols-2 gap-[5px] items-stretch">
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[520px] bg-ivory-mist">
            <Image
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
              alt="An artisan block-printing cloth by hand"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center bg-ivory-mist p-[var(--spacing-60)]">
            <div className="max-w-md">
              <p className="caption uppercase tracking-[0.2em] mb-[var(--spacing-20)]">
                The Craft
              </p>
              <h2 className="text-[32px] font-bold leading-[1.15] mb-[var(--spacing-20)]">
                Made by hand, by people we know.
              </h2>
              <p className="text-base leading-[1.8]">
                Every LINE&LOOP piece begins as raw cotton and silk, dyed by
                hand and cut one piece at a time. We work directly with
                block-printers and embroidery families across Pakistan — fair
                pay, small runs, natural dyes. The slight imperfections are the
                maker&rsquo;s mark, and the point.
              </p>
              <Link
                href="/about"
                className="caption uppercase link-underline inline-block mt-[var(--spacing-30)]"
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
