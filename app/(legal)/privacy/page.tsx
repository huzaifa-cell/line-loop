import { AnimatedWrapper } from "@/components/AnimatedWrapper";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-ivory min-h-screen py-16 md:py-24 px-margin-mobile md:px-margin-desktop text-espresso">
      <AnimatedWrapper delay={0.1} className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight font-normal uppercase">
            Privacy Policy
          </h1>
          <p className="font-label-caps tracking-widest text-espresso/60 uppercase">
            Last Updated: July 2026
          </p>
        </div>

        <div className="space-y-8 font-body-md leading-relaxed text-espresso/90">
          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">1. Introduction</h2>
            <p>
              Welcome to LINE&LOOP. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">2. The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling your order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
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
