import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Consistent empty state per spec §7.15 — heading + supporting line +
 * underlined link. Used across cart-empty, search-no-results, wishlist-empty,
 * order-history-empty. Never a blank screen.
 */
export default function EmptyState({
  heading,
  body,
  linkHref,
  linkLabel,
  className,
}: {
  heading: string;
  body?: string;
  linkHref: string;
  linkLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-[var(--spacing-80)] text-center px-6",
        className
      )}
    >
      <h2 className="text-[24px] font-bold leading-none">{heading}</h2>
      {body && (
        <p className="text-base leading-[1.8] mt-[var(--spacing-20)] max-w-md">
          {body}
        </p>
      )}
      <Link
        href={linkHref}
        className="caption uppercase link-underline mt-[var(--spacing-30)]"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
