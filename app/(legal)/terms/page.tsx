import { AnimatedWrapper } from "@/components/AnimatedWrapper";

export default function TermsOfServicePage() {
  return (
    <main className="bg-ivory min-h-screen py-16 md:py-24 px-margin-mobile md:px-margin-desktop text-espresso">
      <AnimatedWrapper delay={0.1} className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight font-normal uppercase">
            Terms of Service
          </h1>
          <p className="font-label-caps tracking-widest text-espresso/60 uppercase">
            Last Updated: July 2026
          </p>
        </div>

        <div className="space-y-8 font-body-md leading-relaxed text-espresso/90">
          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">1. Agreement to Terms</h2>
            <p>
              By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">2. Products and Pricing</h2>
            <p>
              All products are subject to availability. We reserve the right to limit the quantities of any products that we offer. We have made every effort to display as accurately as possible the colors and images of our products that appear on the store.
            </p>
            <p>
              Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">3. Order Acceptance</h2>
            <p>
              We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">4. Artisanal Variance</h2>
            <p>
              As our garments are handmade, cut, dyed, and stitched by hand, slight variations in color, texture, and size may occur. These variations are a natural characteristic of artisanal production and are not considered defects.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">5. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to us at:
            </p>
            <p className="font-medium">
              <a href="mailto:contact@lineandloop.shop" className="underline underline-offset-4 hover:text-brand-red transition-colors">
                contact@lineandloop.shop
              </a>
            </p>
          </section>
        </div>
      </AnimatedWrapper>
    </main>
  );
}
