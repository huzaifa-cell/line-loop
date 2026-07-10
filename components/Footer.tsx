"use client";

import Link from "next/link";

/**
 * Page-close branding strip — full-width brand-red band that bookends
 * the announcement bar at the top of the page.
 * Client component because of the newsletter form.
 */
const footerNav = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Track Order", href: "/track-order" },
  { label: "Account", href: "/account" },
  { label: "Contact", href: "mailto:hello@lineloop.pk" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-red text-ink-black mt-[var(--spacing-80)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6 py-[var(--spacing-60)]">
        <div className="grid gap-[var(--spacing-60)] md:grid-cols-3">
          <div>
            <p className="font-wordmark text-[40px] leading-none">LINE&LOOP</p>
            <p className="caption mt-[var(--spacing-20)] max-w-xs">
              Handmade ladies&rsquo; garments, made slowly. Cut, dyed and
              stitched by hand in small batches.
            </p>
          </div>

          <div>
            <p className="caption uppercase font-bold mb-[var(--spacing-20)]">
              Explore
            </p>
            <ul className="space-y-[var(--spacing-15)]">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="caption link-underline capitalize"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="caption uppercase font-bold mb-[var(--spacing-20)]">
              The Letter
            </p>
            <p className="caption max-w-xs">
              New pieces, studio notes and slow-fashion stories. No noise.
            </p>
            <form
              className="mt-[var(--spacing-20)] flex border-b border-ink-black"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="caption bg-transparent py-[var(--spacing-10)] flex-1 outline-none placeholder:text-ink-black/50"
              />
              <button
                type="submit"
                className="caption uppercase font-bold py-[var(--spacing-10)]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-[var(--spacing-60)] pt-[var(--spacing-20)] border-t border-ink-black/30 flex flex-col sm:flex-row justify-between gap-[var(--spacing-10)]">
          <p className="caption">
            © {new Date().getFullYear()} LINE&LOOP. All rights reserved.
          </p>
          <p className="caption">Handmade in Pakistan · Ships nationwide</p>
        </div>
      </div>
    </footer>
  );
}
