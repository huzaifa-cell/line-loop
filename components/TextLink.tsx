import Link from "next/link";
import { cn } from "@/lib/utils";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  uppercase?: boolean;
  className?: string;
}

/**
 * The system's primary interaction — a 1px underlined text link.
 * No fill, no border, no radius. Uppercase for navigation, mixed case inline.
 */
export default function TextLink({
  href,
  children,
  uppercase = false,
  className,
}: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "link-underline caption",
        uppercase && "uppercase",
        className
      )}
    >
      {children}
    </Link>
  );
}
