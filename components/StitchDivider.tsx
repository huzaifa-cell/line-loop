import { cn } from "@/lib/utils";

/**
 * Horizontal stitch line — the thread/needle brand motif.
 * Default black; `accent` variant uses Thread Red. A pure divider, never
 * decorative chrome.
 */
export default function StitchDivider({
  accent = false,
  className,
}: {
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(accent ? "stitch-line--accent" : "stitch-line", className)}
    />
  );
}
