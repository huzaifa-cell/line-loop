import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { getFeaturedProducts } from "@/lib/storefront";
import { getLiveBanner } from "@/lib/banners";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const [products, heroBanner] = await Promise.all([
    getFeaturedProducts(4),
    getLiveBanner("homepage_hero"),
  ]);
  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
  };

  // Use banner data if a live hero banner exists, otherwise fallback to defaults
  const heroHeadline = heroBanner?.headline || "Handmade Garments,\nMade Slowly.";
  const heroSubtext = heroBanner?.subtext || "Discover a curated collection of artisanal pieces designed for the feminine silhouette. Precision tailoring meets effortless luxury in every stitch.";
  const heroCtaLabel = heroBanner?.cta_label || "Shop the Collection";
  const heroCtaUrl = heroBanner?.cta_url || "/shop";
  const heroImage = heroBanner?.storage_path
    ? (heroBanner.storage_path.startsWith("http")
        ? heroBanner.storage_path
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${heroBanner.storage_path}`)
    : "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=2560";

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-margin-mobile md:px-margin-desktop overflow-hidden bg-espresso">
        <div className="absolute inset-0 opacity-40 z-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover"
          />
        </div>
        <AnimatedWrapper className="relative z-10 max-w-5xl space-y-8 px-4" delay={0.2}>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-ivory tracking-tight leading-tight">
            {heroHeadline.split("\n").map((line, i) => (
              <span key={i}>{line}{i < heroHeadline.split("\n").length - 1 && <br />}</span>
            ))}
          </h1>
          <p className="font-body-lg text-body-lg text-beige max-w-2xl mx-auto font-light">
            {heroSubtext}
          </p>
          <div className="pt-6">
            <Link href={heroCtaUrl} className="inline-block bg-brand-red text-white px-8 py-4 md:px-12 md:py-5 font-button text-button uppercase rounded-lg hover:bg-white hover:text-brand-red transition-all duration-500 shadow-lg shadow-brand-red/20">
              {heroCtaLabel}
            </Link>
          </div>
        </AnimatedWrapper>
      </section>

      {/* New & Selected (Soft Ivory Section) */}
      <section className="bg-ivory py-section-gap-mobile md:py-section-gap px-margin-mobile md:px-margin-desktop text-mocha">
        <AnimatedWrapper className="flex justify-between items-end mb-8 md:mb-16">
          <div>
            <span className="font-label-caps text-label-caps text-brand-red uppercase mb-2 block tracking-widest">New Arrivals</span>
            <h2 className="font-headline-md text-headline-md tracking-tight text-espresso font-normal">NEW &amp; SELECTED</h2>
          </div>
          <Link href="/shop" className="font-label-caps text-label-caps border-b border-mocha pb-1 hover:text-brand-red hover:border-brand-red transition-colors duration-300">
            VIEW ALL
          </Link>
        </AnimatedWrapper>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {products.slice(0, 4).map((product, index) => (
            <AnimatedWrapper key={product.id} delay={0.1 * index}>
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
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={75}
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  )}
                  {product.tag && (
                    <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-brand-red/90 backdrop-blur-sm text-white px-3 py-1 md:px-4 md:py-1.5 font-label-caps text-[10px] rounded-full tracking-widest">
                      {product.tag}
                    </span>
                  )}
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
      </section>

      {/* Shop by Category */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <AnimatedWrapper delay={0.1} className="relative group overflow-hidden h-[50vh] md:h-[70vh]">
          <Link href="/shop" className="absolute inset-0 flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=1200"
              alt="Kurtis & Tops category"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={70}
              className="object-cover transition-transform duration-1000 group-hover:scale-110 -z-10"
            />
            <div className="absolute inset-0 bg-espresso/40 group-hover:bg-espresso/50 transition-colors duration-500 -z-10"></div>
            <div className="relative text-center px-4 z-10">
              <h3 className="font-display-lg text-display-lg-mobile md:text-headline-md text-ivory tracking-widest mb-6 font-normal">Kurtis &amp; Tops</h3>
              <span className="inline-block border border-ivory text-ivory px-8 py-3 font-button text-button uppercase group-hover:bg-ivory group-hover:text-espresso transition-all duration-500 rounded-md backdrop-blur-sm cursor-pointer">Shop Category</span>
            </div>
          </Link>
        </AnimatedWrapper>
        
        <AnimatedWrapper delay={0.2} className="relative group overflow-hidden h-[50vh] md:h-[70vh] md:border-l border-mocha">
          <Link href="/shop" className="absolute inset-0 flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1631005436794-ccaa79de61ba?auto=format&fit=crop&q=80&w=1200"
              alt="Dresses & Skirts category"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={70}
              className="object-cover transition-transform duration-1000 group-hover:scale-110 -z-10"
            />
            <div className="absolute inset-0 bg-espresso/40 group-hover:bg-espresso/50 transition-colors duration-500 -z-10"></div>
            <div className="relative text-center px-4 z-10">
              <h3 className="font-display-lg text-display-lg-mobile md:text-headline-md text-ivory tracking-widest mb-6 font-normal">Dresses &amp; Skirts</h3>
              <span className="inline-block border border-ivory text-ivory px-8 py-3 font-button text-button uppercase group-hover:bg-ivory group-hover:text-espresso transition-all duration-500 rounded-md backdrop-blur-sm cursor-pointer">Shop Category</span>
            </div>
          </Link>
        </AnimatedWrapper>
      </section>

      {/* The Craft */}
      <section className="bg-mocha py-section-gap-mobile md:py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center max-w-7xl mx-auto">
          <AnimatedWrapper delay={0.2} className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1631005436794-ccaa79de61ba?auto=format&fit=crop&q=80&w=1200"
              alt="Artisan hands stitching"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              className="object-cover sepia-[.3] contrast-125"
            />
          </AnimatedWrapper>
          
          <AnimatedWrapper delay={0.4} className="space-y-8 md:pl-12">
            <span className="font-label-caps text-label-caps text-brand-red uppercase tracking-[0.2em]">Our Heritage</span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-ivory tracking-tight leading-tight font-normal">
              Artisanal mastery, preserved in every thread.
            </h2>
            <p className="font-body-lg text-body-lg text-beige font-light leading-relaxed">
              We reject the velocity of mass production. At LINE&LOOP, every garment is an investment of time, stitched by artisans who have inherited techniques passed down through generations. Our process is intentional, respecting the rhythm of the maker and the grace of the wearer.
            </p>
            <Link href="/about" className="inline-block bg-ivory text-espresso px-8 md:px-10 py-4 font-button text-button uppercase rounded-lg hover:bg-brand-red hover:text-white transition-all duration-500 shadow-xl text-center">
              Discover Our Process
            </Link>
          </AnimatedWrapper>
        </div>
      </section>
    </>
  );
}
