import { cn } from "@/lib/utils";

export default function StitchDivider({
  className,
  accent,
}: {
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full border-t border-dashed",
        accent ? "border-brand-red" : "border-gray-300",
        className
      )}
    />
  );
}
