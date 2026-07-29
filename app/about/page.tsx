import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import Image from "next/image";

export default function About() {
  return (
    <>
      {/* Hero Story Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center text-center overflow-hidden bg-espresso">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1716504628084-97224213ca6d?auto=format&fit=crop&q=80&w=2560"
            alt="Artisan hands stitching"
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover opacity-30 sepia-[.2] contrast-125 mix-blend-luminosity"
          />
        </div>
        <AnimatedWrapper className="relative z-10 max-w-4xl space-y-6 px-margin-mobile md:px-margin-desktop" delay={0.2}>
          <span className="font-label-caps text-label-caps text-brand-red uppercase tracking-[0.3em]">Our Story</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-ivory tracking-tight leading-tight font-normal">
            THE ART OF SLOW FASHION
          </h1>
        </AnimatedWrapper>
      </section>

      {/* Our Philosophy */}
      <section className="bg-ivory py-section-gap-mobile md:py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto">
          <AnimatedWrapper delay={0.1} className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://images.unsplash.com/photo-1558769132-cb1fac08c04b?auto=format&fit=crop&q=80&w=1200"
              alt="Tailor working on fabric"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
          </AnimatedWrapper>
          
          <AnimatedWrapper delay={0.3} className="space-y-8">
            <h2 className="font-headline-md text-headline-md text-espresso font-normal">
              A Rejection of Mass Production
            </h2>
            <div className="space-y-6 font-body-lg text-body-lg text-taupe font-light leading-relaxed">
              <p>
                LINE&LOOP was born out of a desire to return to the roots of garment making. In a world obsessed with velocity, we choose to pause. 
              </p>
              <p>
                Every kurti, shalwar kameez, and trouser is cut, dyed, and stitched by hand in our small ateliers in Pakistan. We don&apos;t believe in seasonal trends that expire; we believe in creating timeless, feminine silhouettes that endure.
              </p>
              <p>
                Our pieces are made in extremely small batches. This isn&apos;t artificial scarcity—it is a true reflection of the time and labor required to craft garments the right way.
              </p>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* The Process */}
      <section className="bg-mocha py-section-gap-mobile md:py-section-gap px-margin-mobile md:px-margin-desktop border-y border-taupe">
        <div className="max-w-7xl mx-auto">
          <AnimatedWrapper className="text-center mb-12 md:mb-20">
            <h2 className="font-headline-md text-headline-md text-ivory font-normal">OUR CRAFT</h2>
          </AnimatedWrapper>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Sourcing Natural Fibers',
                desc: 'We use exclusively natural, breathable fabrics like high-grade linen, cotton, and silk, sourced responsibly to ensure a soft touch against the skin.'
              },
              {
                step: '02',
                title: 'Hand-Dyeing & Block Printing',
                desc: 'Colors are achieved through traditional vat dyeing and intricate hand-block printing techniques that render every single piece subtly unique.'
              },
              {
                step: '03',
                title: 'Precision Stitching',
                desc: 'Our master tailors finish each garment with robust, precise stitching, focusing on the internal architecture of the piece as much as its external drape.'
              }
            ].map((item, i) => (
              <AnimatedWrapper key={item.step} delay={0.2 * i} className="space-y-6">
                <span className="font-display-lg text-brand-red opacity-50">{item.step}.</span>
                <h3 className="font-headline-sm text-headline-sm text-ivory font-normal">{item.title}</h3>
                <p className="font-body-md text-beige font-light">{item.desc}</p>
                <div className="w-12 h-[1px] bg-taupe"></div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Note */}
      <section className="bg-ivory py-section-gap-mobile md:py-section-gap px-margin-mobile md:px-margin-desktop text-center">
        <AnimatedWrapper delay={0.2} className="max-w-3xl mx-auto space-y-8 md:space-y-12">
          <span className="material-symbols-outlined text-4xl text-brand-red">format_quote</span>
          <p className="font-headline-sm text-headline-sm text-espresso font-normal leading-relaxed italic">
            &ldquo;We aren&apos;t just making clothes. We are preserving a heritage of craftsmanship that deserves to be worn, celebrated, and passed down.&rdquo;
          </p>
          <div className="space-y-1">
            <h4 className="font-label-caps text-label-caps text-espresso tracking-widest">FOUNDER & CREATIVE DIRECTOR</h4>
            <p className="font-body-md text-taupe">LINE&LOOP</p>
          </div>
        </AnimatedWrapper>
      </section>
    </>
  );
}
