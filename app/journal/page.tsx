import type { Metadata } from "next";
import Link from "next/link";
import { getJournalEntries } from "@/lib/journal";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Slow-fashion stories from the LINE&LOOP studio — process, craft, and the makers behind every piece.",
};

export default function JournalIndex() {
  const entries = getJournalEntries();

  return (
    <section className="bg-warm-parchment py-[var(--spacing-30)]">
      <div className="mx-auto max-w-[720px] px-6">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Journal" }]}
          className="mb-[var(--spacing-30)]"
        />
        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-40)]">
          Journal
        </h1>

        <div className="divide-y divide-ink-black/15">
          {entries.map((entry) => (
            <article key={entry.slug} className="py-[var(--spacing-30)]">
              <p className="caption uppercase opacity-60 mb-[var(--spacing-10)]">
                {new Date(entry.date).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <Link
                href={`/journal/${entry.slug}`}
                className="text-[24px] font-bold leading-[1.2] link-underline inline-block mb-[var(--spacing-10)]"
              >
                {entry.title}
              </Link>
              <p className="text-base leading-[1.8] opacity-80">
                {entry.excerpt}
              </p>
              <Link
                href={`/journal/${entry.slug}`}
                className="caption uppercase link-underline mt-[var(--spacing-15)] inline-block"
              >
                Read More
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
