import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import StitchDivider from "@/components/StitchDivider";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

type SearchParams = Promise<{ order?: string }>;

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    return (
      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[640px] px-6">
          <EmptyState
            heading="No order found"
            body="We couldn't find an order to confirm."
            linkHref="/shop"
            linkLabel="Shop the Collection"
          />
        </div>
      </section>
    );
  }

  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return (
      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[640px] px-6">
          <EmptyState
            heading="Order not found"
            body={`We couldn\u2019t find order ${orderNumber}.`}
            linkHref="/track-order"
            linkLabel="Track an Order"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-parchment py-[var(--spacing-40)]">
      <div className="mx-auto max-w-[640px] px-6">
        <Breadcrumb
          items={[{ label: "Shop", href: "/shop" }, { label: "Order Confirmed" }]}
          className="mb-[var(--spacing-30)]"
        />

        {/* Confirmation header */}
        <div className="text-center mb-[var(--spacing-40)]">
          <p className="caption uppercase tracking-[0.2em] text-brand-red mb-[var(--spacing-15)]">
            Thank You
          </p>
          <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-15)]">
            Order Confirmed
          </h1>
          <p className="caption">
            Your order number is{" "}
            <span className="font-bold">{order.orderNumber}</span>
          </p>
          <p className="caption opacity-60 mt-[var(--spacing-10)]">
            A confirmation has been sent to {order.customerEmail}
          </p>
        </div>

        <StitchDivider accent className="my-[var(--spacing-30)]" />

        {/* Payment notice */}
        <div className="mb-[var(--spacing-30)]">
          {order.paymentMethod === "CARD" ? (
            <p className="text-base leading-[1.8]">
              Your card ending in{" "}
              <span className="font-bold">
                {order.cardDetails?.last4 ?? "****"}
              </span>{" "}
              ({order.cardDetails?.cardBrand ?? "Card"}) will be processed by our
              team shortly. We will email you once payment is confirmed.
            </p>
          ) : (
            <p className="text-base leading-[1.8]">
              Please have{" "}
              <span className="font-bold">{formatPrice(order.total)}</span> ready
              in cash for our courier upon delivery.
            </p>
          )}
        </div>

        {/* Order details */}
        <div className="border border-ink-black/15 p-[var(--spacing-30)] mb-[var(--spacing-30)]">
          <p className="caption uppercase font-bold mb-[var(--spacing-20)]">
            Order Details
          </p>
          <div className="space-y-[var(--spacing-15)]">
            {order.lines.map((line) => (
              <div
                key={`${line.slug}-${line.size}-${line.colour}`}
                className="flex justify-between caption"
              >
                <span>
                  {line.name} · {line.colour} · {line.size} · Qty {line.qty}
                </span>
                <span className="font-bold">
                  {formatPrice(line.price * line.qty)}
                </span>
              </div>
            ))}
          </div>
          <StitchDivider className="my-[var(--spacing-15)]" />
          <div className="space-y-[var(--spacing-10)]">
            <div className="flex justify-between caption">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between caption">
                <span>Discount</span>
                <span className="text-brand-red">
                  –{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between caption">
              <span>
                Shipping ({order.shippingMethod === "EXPRESS" ? "Express" : "Standard"})
              </span>
              <span>
                {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
              </span>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between caption">
                <span>COD Fee</span>
                <span>{formatPrice(order.codFee)}</span>
              </div>
            )}
            <div className="flex justify-between caption font-bold text-base pt-[var(--spacing-10)]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="mb-[var(--spacing-30)]">
          <p className="caption uppercase font-bold mb-[var(--spacing-10)]">
            Shipping To
          </p>
          <p className="caption">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            {order.shippingAddress.addressLine2 && (
              <>
                <br />
                {order.shippingAddress.addressLine2}
              </>
            )}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Status timeline */}
        <div className="mb-[var(--spacing-30)]">
          <p className="caption uppercase font-bold mb-[var(--spacing-15)]">
            Order Status
          </p>
          <OrderTimeline currentStatus={order.status} />
        </div>

        <div className="flex flex-col sm:flex-row gap-[var(--spacing-15)]">
          <Link
            href={`/track-order?order=${order.orderNumber}&email=${encodeURIComponent(order.customerEmail)}`}
            className="caption uppercase link-underline text-center py-[var(--spacing-15)]"
          >
            Track This Order
          </Link>
          <Link
            href="/shop"
            className="caption uppercase link-underline text-center py-[var(--spacing-15)]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

function OrderTimeline({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentIndex = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <p className="caption text-brand-red font-bold">Order Cancelled</p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-10)]">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-[var(--spacing-15)]">
          <span
            className={
              i <= currentIndex
                ? "caption uppercase font-bold border-b border-[var(--color-brand-red)] pb-[2px]"
                : "caption uppercase opacity-40"
            }
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
          {i === currentIndex && (
            <span className="caption text-brand-red">— Current</span>
          )}
        </div>
      ))}
    </div>
  );
}
