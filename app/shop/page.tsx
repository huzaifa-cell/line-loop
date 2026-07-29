import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { getStorefrontProducts } from "@/lib/storefront";
import Image from "next/image";
import Link from "next/link";

export default async function ShopPage() {
  const products = await getStorefrontProducts();
  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
  };
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

      {/* Filter & Sort Bar */}
      <div className="sticky top-14 md:top-20 z-40 bg-espresso/95 backdrop-blur-md border-b border-mocha px-margin-mobile md:px-margin-desktop py-3 md:py-4 flex flex-wrap md:flex-row justify-between items-center gap-2 md:gap-4">
        <div className="flex gap-4 md:gap-8 overflow-x-auto">
          <button className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap">
            CATEGORY <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap">
            SIZE <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap">
            COLOR <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body-md text-taupe text-sm">{products.length} PRODUCTS</span>
          <button className="flex items-center gap-2 font-label-caps text-label-caps text-ivory">
            SORT BY <span className="material-symbols-outlined text-[16px]">sort</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <section className="bg-ivory py-8 md:py-16 px-margin-mobile md:px-margin-desktop min-h-screen">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-16">
          {products.map((product, index) => (
            <AnimatedWrapper key={product.id} delay={0.1 * (index % 4)}>
              <Link href={`/shop/${product.id}`} className="group cursor-pointer block">
                <div className="relative aspect-[3/4] overflow-hidden mb-3 md:mb-5 rounded-md shadow-sm">
                  {isVideo(product.image) ? (
                    <video 
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <Image 
                      src={product.image} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      quality={75}
                      priority={index < 4}
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  )}
                  {product.tag && (
                    <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-brand-red/90 backdrop-blur-sm text-white px-3 py-1 md:px-4 md:py-1.5 font-label-caps text-[10px] rounded-full tracking-widest">
                      {product.tag}
                    </span>
                  )}
                  {/* Quick Add Hover Effect */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <button className="w-full bg-ivory/95 backdrop-blur text-espresso font-button text-[12px] py-3 rounded-sm hover:bg-brand-red hover:text-white transition-colors">
                      QUICK ADD
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-body-md font-medium tracking-wide text-espresso text-sm md:text-base">{product.name}</h3>
                  <p className="font-body-md text-taupe text-sm md:text-base">
                    {product.originalPrice && <span className="line-through text-beige mr-3">Rs. {product.originalPrice.toLocaleString()}</span>}
                    Rs. {product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </AnimatedWrapper>
          ))}
        </div>

        {/* Pagination */}
        <AnimatedWrapper delay={0.2} className="mt-12 md:mt-24 flex justify-center items-center gap-4">
          <button className="text-taupe hover:text-espresso transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-espresso text-ivory font-body-md text-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-taupe hover:bg-beige/30 transition-colors font-body-md text-sm">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-taupe hover:bg-beige/30 transition-colors font-body-md text-sm">3</button>
          <span className="text-taupe">...</span>
          <button className="text-taupe hover:text-espresso transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
        </AnimatedWrapper>
      </section>
    </>
  );
}
