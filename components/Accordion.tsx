"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * Plain accordion — plain text "+" / "–" toggle, no chevrons, no icons.
 * Used on PDP (Fabric & Care / Fit Notes / Shipping & Returns) and
 * checkout (order summary).
 */
export default function Accordion({
  title,
  children,
  className,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-t border-ink-black/15", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-[var(--spacing-20)] caption uppercase font-bold text-left"
        aria-expanded={open}
      >
        {title}
        <span className="text-base font-normal leading-none select-none">
          {open ? "–" : "+"}
        </span>
      </button>
      {open && (
        <div className="pb-[var(--spacing-20)] text-base leading-[1.8]">
          {children}
        </div>
      )}
    </div>
  );
}
