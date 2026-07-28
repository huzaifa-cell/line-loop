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
            <h2 className="font-headline-sm uppercase tracking-widest">Shipping Policy</h2>
            <p>
              We process all orders within 1-2 business days. Delivery times vary based on your selected shipping method during checkout:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Standard Delivery:</strong> 3-5 Business Days (Free)</li>
              <li><strong>Express Delivery:</strong> 1-2 Business Days (Rs. 500)</li>
            </ul>
            <p>
              Once your order has been dispatched, you will receive a tracking link via email to monitor its progress.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">Return Policy</h2>
            <p>
              We accept returns within 14 days of delivery. To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it, with all original tags attached.
            </p>
            <p>
              Because our pieces are handmade in limited quantities, we cannot guarantee exchanges for different sizes. If you need a different size, we recommend returning your original item for a refund and placing a new order.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">Non-Returnable Items</h2>
            <p>
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Items marked as "Final Sale"</li>
              <li>Customized or altered garments</li>
              <li>Items that show signs of wear, washing, or damage</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline-sm uppercase tracking-widest">How to Initiate a Return</h2>
            <p>
              To initiate a return, please contact our support team with your order number and reason for return. We will provide you with the return address and further instructions.
            </p>
            <p className="font-medium">
              <a href="mailto:contact@lineandloop.shop" className="underline underline-offset-4 hover:text-brand-red transition-colors">
                contact@lineandloop.shop
              </a>
            </p>
            <p className="text-sm text-espresso/70 mt-2">
              Please note that customers are responsible for return shipping costs unless the item arrived damaged or incorrect.
            </p>
          </section>
        </div>
      </AnimatedWrapper>
    </main>
  );
}
