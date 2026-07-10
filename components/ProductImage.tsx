import Image from "next/image";

/**
 * Product image wrapper — enforces 0px radius, uses next/image, supports
 * blur placeholder. Used on ProductCard, PDP gallery, and anywhere product
 * photography appears. Never add rounded corners anywhere else.
 */
export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  className,
  blurDataURL,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  blurDataURL?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      sizes={sizes}
      className={className}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
    />
  );
}
