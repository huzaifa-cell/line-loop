import type { Metadata } from "next";
import { getStorefrontOrderByNumberAndEmail } from "@/lib/storefront";
import { formatPrice } from "@/lib/utils";
import StitchDivider from "@/components/StitchDivider";
import Breadcrumb from "@/components/Breadcrumb";
import TrackForm from "./TrackForm";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your LINE&LOOP order by order number and email.",
};

type SearchParams = Promise<{ order?: string; email?: string }>;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { order: orderNumber, email } = await searchParams;

  let order = null;
  let notFound = false;

  if (orderNumber && email) {
    order = await getStorefrontOrderByNumberAndEmail(orderNumber, email);
    if (!order) notFound = true;
  }

  return (
    <section className="bg-warm-parchment py-[var(--spacing-60)]">
      <div className="mx-auto max-w-[640px] px-6">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
          className="mb-[var(--spacing-30)]"
        />
        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-30)]">
          Track Your Order
        </h1>

        <TrackForm
          initialOrderNumber={orderNumber ?? ""}
          initialEmail={email ?? ""}
        />

        {notFound && (
          <div className="mt-[var(--spacing-30)]">
            <EmptyState
              heading="Order not found"
              body="Check your order number and email and try again."
              linkHref="/track-order"
              linkLabel="Try Again"
            />
          </div>
        )}

        {order && (
          <div className="mt-[var(--spacing-40)]">
            <StitchDivider accent className="mb-[var(--spacing-30)]" />

            <div className="mb-[var(--spacing-30)]">
              <p className="caption uppercase opacity-60">Order Number</p>
              <p className="caption font-bold text-base">
                {order.orderNumber}
              </p>
              <p className="caption opacity-60 mt-[var(--spacing-10)]">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Status timeline */}
            <div className="mb-[var(--spacing-30)]">
              <p className="caption uppercase font-bold mb-[var(--spacing-15)]">
                Status Timeline
              </p>
              <StatusTimeline currentStatus={order.status} />
            </div>

            <StitchDivider className="my-[var(--spacing-20)]" />

            {/* Order items */}
            <div className="mb-[var(--spacing-20)]">
              <p className="caption uppercase font-bold mb-[var(--spacing-15)]">
                Items
              </p>
              <div className="space-y-[var(--spacing-10)]">
                {order.lines.map((line) => (
                  <div
                    key={`${line.name}-${line.size}-${line.colour}`}
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
            </div>

            <StitchDivider className="my-[var(--spacing-20)]" />

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
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatPrice(order.shippingCost)}
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

            <StitchDivider className="my-[var(--spacing-20)]" />

            {/* Shipping address */}
            <div>
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
          </div>
        )}
      </div>
    </section>
  );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentIndex = steps.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return <p className="caption text-brand-red font-bold">Order Cancelled</p>;
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
