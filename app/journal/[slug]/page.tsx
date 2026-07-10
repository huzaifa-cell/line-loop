import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalEntry, getJournalEntries } from "@/lib/journal";
import Breadcrumb from "@/components/Breadcrumb";
import StitchDivider from "@/components/StitchDivider";

export async function generateStaticParams() {
  return getJournalEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.excerpt,
  };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getJournalEntry(slug);
  if (!entry) notFound();

  const more = getJournalEntries()
    .filter((e) => e.slug !== slug)
    .slice(0, 3);

  return (
    <article>
      {/* Full-bleed opener */}
      <section className="relative h-[60vh] min-h-[400px] w-full bg-ink-black overflow-hidden">
        <Image
          src={entry.coverImage}
          alt={entry.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-black/30 via-transparent to-ink-black/70" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="font-wordmark text-ivory-mist text-center select-none mix-blend-exclusion text-[clamp(32px,8vw,72px)] leading-[1.1]">
            {entry.title}
          </h1>
        </div>
      </section>

      {/* Body — editorial long-form, max-width 720px */}
      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[720px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Journal", href: "/journal" },
              { label: entry.title },
            ]}
            className="mb-[var(--spacing-30)]"
          />

          <p className="caption uppercase opacity-60 mb-[var(--spacing-30)]">
            {new Date(entry.date).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {entry.author}
          </p>

          {/* Excerpt as pull-quote with stitch lines */}
          {entry.body[0] && (
            <div className="my-[var(--spacing-30)]">
              <div className="flex items-center gap-[var(--spacing-20)] mb-[var(--spacing-15)]">
                <StitchDivider accent className="flex-1" />
              </div>
              <p className="text-[24px] font-bold leading-[1.4] italic">
                {entry.excerpt}
              </p>
              <div className="flex items-center gap-[var(--spacing-20)] mt-[var(--spacing-15)]">
                <StitchDivider accent className="flex-1" />
              </div>
            </div>
          )}

          {/* Body paragraphs */}
          <div className="space-y-[var(--spacing-30)]">
            {entry.body.map((para, i) => (
              <p key={i} className="text-base leading-[1.8]">
                {para}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-[var(--spacing-40)] flex flex-wrap gap-[var(--spacing-10)]">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="caption uppercase border border-ink-black/30 px-[var(--spacing-15)] py-[6px]"
              >
                {tag}
              </span>
            ))}
          </div>

          <StitchDivider className="my-[var(--spacing-40)]" />

          <Link
            href="/journal"
            className="caption uppercase link-underline"
          >
            Back to Journal
          </Link>
        </div>
      </section>

      {/* More entries */}
      <section className="bg-ivory-mist py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <h2 className="text-[24px] font-bold leading-none mb-[var(--spacing-30)]">
            More from the Journal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[5px]">
            {more.map((e) => (
              <Link key={e.slug} href={`/journal/${e.slug}`} className="group">
                <div className="relative aspect-[4/5] bg-warm-parchment overflow-hidden">
                  <Image
                    src={e.coverImage}
                    alt={e.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                  />
                </div>
                <p className="caption mt-[var(--spacing-15)] font-bold">
                  {e.title}
                </p>
                <p className="caption opacity-60 mt-[5px]">{e.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
