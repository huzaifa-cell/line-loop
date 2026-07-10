import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string; // no href = current (unlinked)
}

/**
 * Breadcrumb navigation — 12px, uppercase, "/" separators.
 * Used on Shop, PDP, Journal, Account consistently (spec §3.2).
 */
export default function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("caption uppercase", className)}>
      <ol className="flex items-center gap-[var(--spacing-10)]">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-[var(--spacing-10)]">
            {i > 0 && <span className="opacity-40">/</span>}
            {item.href ? (
              <Link href={item.href} className="link-underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-bold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
