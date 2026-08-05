import Link from "next/link";
import { getLiveBanner } from "@/lib/banners";

/**
 * Site-wide top message strip — full-width brand-red band.
 * Pulls content from the `banners` table (placement = 'announcement_bar').
 * Falls back to a default message if no live banner exists.
 */
export default async function AnnouncementBar() {
  const banner = await getLiveBanner("announcement_bar");

  const text =
    banner?.headline ||
    "Complimentary hand-finished gift wrap on every order";
  const ctaLabel = banner?.cta_label;
  const ctaUrl = banner?.cta_url;

  return (
    <div className="bg-brand-red text-ink-black w-full text-center">
      <p className="caption py-[9px] px-5">
        {text}
        {ctaLabel && ctaUrl && (
          <>
            {" "}
            <Link
              href={ctaUrl}
              className="underline underline-offset-2 font-bold hover:opacity-80 transition-opacity"
            >
              {ctaLabel}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
