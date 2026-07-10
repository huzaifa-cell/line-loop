import { cn } from "@/lib/utils";

/**
 * The ONE deliberate exception to the text-link-only rule (spec law 1).
 * Dashed border echoing the stitch motif; never filled, never rounded.
 * Use only for: Add to Bag, Checkout, Place Order.
 */
export default function DashedCTA({
  children,
  type = "button",
  disabled,
  className,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn("dashed-cta", className)}
    >
      {children}
    </button>
  );
}
