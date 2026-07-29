import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { getStorefrontProducts } from "@/lib/storefront";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getStorefrontProducts();
  
  return (
    <>
      {/* Shop Header Section */}
      <section className="bg-espresso py-12 md:py-24 px-margin-mobile md:px-margin-desktop text-center border-b border-mocha">
        <AnimatedWrapper delay={0.1} className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight font-normal text-ivory">
            THE COLLECTION
          </h1>
          <p className="font-body-lg text-body-lg text-beige font-light mx-auto max-w-2xl">
            Artisanal garments crafted slowly. Designed for the modern feminine silhouette. Each piece is a testament to heritage and meticulous design.
          </p>
        </AnimatedWrapper>
      </section>

      <ShopClient products={products} />
    </>
  );
}
