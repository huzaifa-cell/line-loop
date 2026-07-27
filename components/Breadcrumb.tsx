import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav className={cn("flex text-sm text-gray-500 space-x-2", className)}>
      {items.map((item, i) => (
        <span key={i} className="flex space-x-2 items-center">
          {item.href ? (
            <Link href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ) : (
            <span className="text-black">{item.label}</span>
          )}
          {i < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
