import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { getStorefrontProducts } from "@/lib/storefront";
import { getLiveBanner } from "@/lib/banners";
import Image from "next/image";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categoryBanner] = await Promise.all([
    getStorefrontProducts(),
    getLiveBanner("category_banner")
  ]);
  
  const headline = categoryBanner?.headline || "THE COLLECTION";
  const subtext = categoryBanner?.subtext || "Artisanal garments crafted slowly. Designed for the modern feminine silhouette. Each piece is a testament to heritage and meticulous design.";
  const hasImage = !!categoryBanner?.storage_path;
  const imageUrl = hasImage
    ? (categoryBanner.storage_path.startsWith("http")
        ? categoryBanner.storage_path
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${categoryBanner.storage_path}`)
    : "";

  return (
    <>
      {/* Shop Header Section */}
      <section className={`relative py-12 md:py-24 px-margin-mobile md:px-margin-desktop text-center border-b border-mocha overflow-hidden ${hasImage ? 'min-h-[40vh] flex flex-col items-center justify-center' : 'bg-espresso'}`}>
        {hasImage && (
          <div className="absolute inset-0 opacity-40 z-0">
            <Image
              src={imageUrl}
              alt={headline}
              fill
              priority
              sizes="100vw"
              quality={70}
              className="object-cover"
            />
          </div>
        )}
        <AnimatedWrapper delay={0.1} className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight font-normal text-ivory">
            {headline}
          </h1>
          <p className="font-body-lg text-body-lg text-beige font-light mx-auto max-w-2xl">
            {subtext}
          </p>
        </AnimatedWrapper>
      </section>

      <ShopClient products={products} />
    </>
  );
}
