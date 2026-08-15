import { AnimatedWrapper } from "@/components/AnimatedWrapper";

export default function ShippingReturnsPage() {
  return (
    <main className="bg-ivory min-h-screen py-16 md:py-24 px-margin-mobile md:px-margin-desktop text-espresso">
      <AnimatedWrapper delay={0.1} className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight font-normal uppercase">
            Shipping & Returns
          </h1>
        </div>

        <div className="space-y-8 font-body-md leading-relaxed text-espresso/90">
          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">Shipping</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders are dispatched within 2–4 working days after confirmation.</li>
              <li>Delivery within Pakistan usually takes 3–5 working days, depending on the location.</li>
              <li>Delivery charges are calculated at checkout or communicated before dispatch.</li>
            </ul>
            <p className="pt-2">
              Please ensure that your contact number and delivery address are correct when placing your order.
              <br />
              Line N Loop is not responsible for delays caused by courier services, incorrect addresses, or circumstances beyond our control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">Returns & Exchanges</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We carefully inspect every item before dispatch to ensure it meets our quality standards.</li>
              <li>Returns are accepted only in case of a damaged, defective, or incorrect item.</li>
              <li>Any issue must be reported within 48 hours of receiving the order, along with clear photos/videos of the item and packaging.</li>
              <li>Items must be unused, unwashed, unaltered, and returned with their original tags and packaging.</li>
              <li>Items damaged due to washing, ironing, alteration, or improper handling will not be eligible for return or exchange.</li>
              <li>Sale, discounted, customized, and made-to-order items are non-returnable and non-exchangeable.</li>
              <li>Once the returned item is received and inspected, we will arrange a replacement or refund, as applicable.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">Important</h2>
            <p>
              Please check your order carefully before removing tags or using the product. By placing an order with Line N Loop, you agree to the terms of this Shipping & Returns Policy.
            </p>
          </section>
        </div>
      </AnimatedWrapper>
    </main>
  );
}
