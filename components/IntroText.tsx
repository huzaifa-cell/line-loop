import Link from "next/link";

/**
 * Brand statement / about paragraph — centered column on warm parchment,
 * ~640px max-width, generous breathing room. Followed by a centered
 * "FIND OUT MORE" text link.
 */
export default function IntroText() {
  return (
    <section className="bg-warm-parchment">
      <div className="mx-auto max-w-[640px] px-6 py-[var(--spacing-80)] text-center">
        <p className="text-base leading-[1.8]">
          LINE&LOOP is a small studio making handmade garments for women —
          kurtis, shalwar kameez, trousers and dupattas, cut, dyed and stitched
          by hand. We work in natural dyes, in tiny batches, with makers we know
          by name. Nothing here is rushed, or made twice the same way.
        </p>
        <Link
          href="/about"
          className="caption uppercase link-underline inline-block mt-[var(--spacing-30)]"
        >
          Find Out More
        </Link>
      </div>
    </section>
  );
}
