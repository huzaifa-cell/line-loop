"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import DashedCTA from "@/components/DashedCTA";
import UnderlineInput from "@/components/UnderlineInput";
import Accordion from "@/components/Accordion";
import EmptyState from "@/components/EmptyState";
import {
  formatCardNumber,
  formatExpiry,
  validateCardForm,
  detectBrand,
  getLast4,
} from "@/lib/card";
import { validateDiscountCode } from "@/lib/discount";
import { createOrder } from "@/lib/orders";
import type { ShippingAddress } from "@/lib/orders";

const STEPS = ["INFORMATION", "SHIPPING", "PAYMENT"] as const;
type Step = (typeof STEPS)[number];

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();

  const [step, setStep] = useState<Step>("INFORMATION");
  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");
  const [discountApplied, setDiscountApplied] = useState<{
    code: string;
    amount: number;
    label: string;
  } | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Shipping address state
  const [addr, setAddr] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Pakistan",
  });

  // Card form state
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Shipping costs
  const STANDARD_SHIPPING = 350;
  const EXPRESS_SHIPPING = 800;
  const FREE_SHIPPING_THRESHOLD = 10000;
  const COD_FEE = 150;

  const shippingCost = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return shippingMethod === "EXPRESS" ? EXPRESS_SHIPPING : STANDARD_SHIPPING;
  }, [subtotal, shippingMethod]);

  function applyDiscount() {
    if (!discountInput.trim()) return;
    const result = validateDiscountCode(discountInput, subtotal);
    if (result.valid) {
      setDiscountApplied({
        code: discountInput.toUpperCase().trim(),
        amount: result.discount,
        label: result.label!,
      });
    } else {
      setDiscountApplied(null);
      setError("Invalid discount code");
      setTimeout(() => setError(""), 3000);
    }
  }

  const codFee = paymentMethod === "COD" ? COD_FEE : 0;
  const discount = discountApplied?.amount ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost + codFee;

  function validateInformation(): boolean {
    return (
      addr.fullName.trim().length > 1 &&
      /\S+@\S+\.\S+/.test(addr.email) &&
      addr.phone.trim().length >= 7 &&
      addr.addressLine1.trim().length > 2 &&
      addr.city.trim().length > 1 &&
      addr.province.trim().length > 1 &&
      addr.postalCode.trim().length > 2
    );
  }

  function handlePlaceOrder() {
    setError("");

    if (paymentMethod === "CARD") {
      const validation = validateCardForm({
        cardholderName: cardholder,
        cardNumber,
        expiry,
        cvv,
      });
      if (!validation.isValid) {
        setCardErrors(validation.errors as Record<string, string>);
        return;
      }
      setCardErrors({});
    }

    setPlacing(true);

    (async () => {
      try {
        const orderLines = lines.map((l) => ({
          slug: l.slug,
          name: l.name,
          price: l.price,
          image: l.image,
          size: l.size,
          colour: l.colour,
          qty: l.qty,
          variantId: l.variantId,
        }));

        const cardDetails =
          paymentMethod === "CARD"
            ? {
                cardholderName: cardholder,
                last4: getLast4(cardNumber),
                expiryMonth: expiry.slice(0, 2),
                expiryYear: expiry.slice(3, 5),
                cardBrand: detectBrand(cardNumber),
              }
            : undefined;

        const order = await createOrder({
          lines: orderLines,
          shippingAddress: addr,
          shippingMethod,
          paymentMethod,
          cardDetails,
          discountCode: discountApplied?.code,
          discountAmount: discount,
        });

        // Clear PAN/CVV from memory
        setCardNumber("");
        setCvv("");

        // Clear cart
        clear();

        router.push(`/checkout/confirmation?order=${order.orderNumber}`);
      } catch {
        setError("Something went wrong. Please try again.");
        setPlacing(false);
      }
    })();
  }

  if (lines.length === 0) {
    return (
      <section className="bg-warm-parchment py-[var(--spacing-60)]">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6">
          <EmptyState
            heading="Your bag is empty"
            body="Add a piece to your bag before checking out."
            linkHref="/shop"
            linkLabel="Shop the Collection"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-parchment py-[var(--spacing-30)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <div className="grid gap-[var(--spacing-60)] lg:grid-cols-[1fr_400px]">
          {/* Left: checkout form — single column ≤640px */}
          <div className="max-w-[640px]">
            <Link
              href="/cart"
              className="caption uppercase link-underline mb-[var(--spacing-20)] inline-block"
            >
              Back to Bag
            </Link>

            {/* Step indicator */}
            <div className="flex items-center gap-[var(--spacing-15)] mb-[var(--spacing-40)]">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-[var(--spacing-15)]">
                  {i > 0 && <span className="caption opacity-30">—</span>}
                  <span
                    className={cn(
                      "caption uppercase",
                      step === s
                        ? "font-bold border-b border-[var(--color-brand-red)] pb-[2px]"
                        : "opacity-50"
                    )}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: INFORMATION */}
            {step === "INFORMATION" && (
              <div className="space-y-[var(--spacing-20)]">
                <h2 className="text-[24px] font-bold leading-none">
                  Contact & Shipping Address
                </h2>
                <UnderlineInput
                  label="Full Name"
                  name="fullName"
                  required
                  autoComplete="name"
                  value={addr.fullName}
                  onChange={(e) =>
                    setAddr({ ...addr, fullName: e.target.value })
                  }
                />
                <UnderlineInput
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={addr.email}
                  onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                />
                <UnderlineInput
                  label="Phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={addr.phone}
                  onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                />
                <UnderlineInput
                  label="Address Line 1"
                  name="addressLine1"
                  required
                  autoComplete="address-line1"
                  value={addr.addressLine1}
                  onChange={(e) =>
                    setAddr({ ...addr, addressLine1: e.target.value })
                  }
                />
                <UnderlineInput
                  label="Address Line 2 (optional)"
                  name="addressLine2"
                  autoComplete="address-line2"
                  value={addr.addressLine2 ?? ""}
                  onChange={(e) =>
                    setAddr({ ...addr, addressLine2: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-[var(--spacing-20)]">
                  <UnderlineInput
                    label="City"
                    name="city"
                    required
                    autoComplete="address-level2"
                    value={addr.city}
                    onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  />
                  <UnderlineInput
                    label="Province"
                    name="province"
                    required
                    autoComplete="address-level1"
                    value={addr.province}
                    onChange={(e) =>
                      setAddr({ ...addr, province: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-[var(--spacing-20)]">
                  <UnderlineInput
                    label="Postal Code"
                    name="postalCode"
                    required
                    autoComplete="postal-code"
                    value={addr.postalCode}
                    onChange={(e) =>
                      setAddr({ ...addr, postalCode: e.target.value })
                    }
                  />
                  <UnderlineInput
                    label="Country"
                    name="country"
                    required
                    autoComplete="country-name"
                    value={addr.country}
                    onChange={(e) =>
                      setAddr({ ...addr, country: e.target.value })
                    }
                  />
                </div>
                <DashedCTA
                  disabled={!validateInformation()}
                  onClick={() => setStep("SHIPPING")}
                >
                  Continue to Shipping
                </DashedCTA>
              </div>
            )}

            {/* STEP 2: SHIPPING */}
            {step === "SHIPPING" && (
              <div className="space-y-[var(--spacing-20)]">
                <h2 className="text-[24px] font-bold leading-none">
                  Shipping Method
                </h2>
                <div className="flex flex-col">
                  <button
                    onClick={() => setShippingMethod("STANDARD")}
                    className={cn(
                      "caption uppercase flex items-center justify-between py-[var(--spacing-15)] border-b transition-colors text-left",
                      shippingMethod === "STANDARD"
                        ? "font-bold border-[var(--color-brand-red)]"
                        : "border-ink-black/15 hover:border-ink-black"
                    )}
                  >
                    <span>
                      Standard · 5–7 working days
                    </span>
                    <span>
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? "Free"
                        : formatPrice(STANDARD_SHIPPING)}
                    </span>
                  </button>
                  <button
                    onClick={() => setShippingMethod("EXPRESS")}
                    className={cn(
                      "caption uppercase flex items-center justify-between py-[var(--spacing-15)] border-b transition-colors text-left",
                      shippingMethod === "EXPRESS"
                        ? "font-bold border-[var(--color-brand-red)]"
                        : "border-ink-black/15 hover:border-ink-black"
                    )}
                  >
                    <span>
                      Express · 2–3 working days
                    </span>
                    <span>{formatPrice(EXPRESS_SHIPPING)}</span>
                  </button>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="caption opacity-60">
                    Free standard shipping on orders over{" "}
                    {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                  </p>
                )}
                <div className="flex gap-[var(--spacing-15)]">
                  <button
                    onClick={() => setStep("INFORMATION")}
                    className="caption uppercase link-underline py-[var(--spacing-15)]"
                  >
                    Back
                  </button>
                  <div className="flex-1">
                    <DashedCTA onClick={() => setStep("PAYMENT")}>
                      Continue to Payment
                    </DashedCTA>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === "PAYMENT" && (
              <div className="space-y-[var(--spacing-20)]">
                <h2 className="text-[24px] font-bold leading-none">Payment</h2>

                {/* Payment method tabs */}
                <div className="flex border-b border-ink-black/15">
                  <button
                    onClick={() => setPaymentMethod("CARD")}
                    className={cn(
                      "caption uppercase py-[var(--spacing-15)] px-[var(--spacing-20)] transition-colors",
                      paymentMethod === "CARD"
                        ? "font-bold border-b border-[var(--color-brand-red)]"
                        : "opacity-50"
                    )}
                  >
                    Pay by Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "caption uppercase py-[var(--spacing-15)] px-[var(--spacing-20)] transition-colors",
                      paymentMethod === "COD"
                        ? "font-bold border-b border-[var(--color-brand-red)]"
                        : "opacity-50"
                    )}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {/* Card form */}
                {paymentMethod === "CARD" && (
                  <div className="space-y-[var(--spacing-20)]">
                    <p className="caption opacity-60">
                      Your card details are processed by our team. We do not
                      store your full card number or CVV — only the last four
                      digits and expiry for reference.
                    </p>
                    <UnderlineInput
                      label="Cardholder Name"
                      name="cardholder"
                      required
                      value={cardholder}
                      onChange={(e) => setCardholder(e.target.value)}
                    />
                    <div>
                      <UnderlineInput
                        label="Card Number"
                        name="cardNumber"
                        required
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                      />
                      {cardErrors.number && (
                        <p className="caption text-brand-red mt-[5px]">
                          {cardErrors.number}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-[var(--spacing-20)]">
                      <div>
                        <UnderlineInput
                          label="Expiry (MM/YY)"
                          name="expiry"
                          required
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(formatExpiry(e.target.value))
                          }
                        />
                        {cardErrors.expiry && (
                          <p className="caption text-brand-red mt-[5px]">
                            {cardErrors.expiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <UnderlineInput
                          label="CVV"
                          name="cvv"
                          required
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                          }
                        />
                        {cardErrors.cvv && (
                          <p className="caption text-brand-red mt-[5px]">
                            {cardErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* COD */}
                {paymentMethod === "COD" && (
                  <div className="space-y-[var(--spacing-15)]">
                    <p className="caption">
                      Pay in cash when your order is delivered. A handling fee
                      of {formatPrice(COD_FEE)} applies.
                    </p>
                    <p className="caption opacity-60">
                      Please have the exact amount ready. Our courier will
                      collect payment before handing over your parcel.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="caption text-brand-red">{error}</p>
                )}

                <div className="flex gap-[var(--spacing-15)]">
                  <button
                    onClick={() => setStep("SHIPPING")}
                    className="caption uppercase link-underline py-[var(--spacing-15)]"
                  >
                    Back
                  </button>
                  <div className="flex-1">
                    <DashedCTA disabled={placing} onClick={handlePlaceOrder}>
                      {placing ? "Placing Order…" : "Place Order"}
                    </DashedCTA>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary (desktop) / accordion (mobile) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="hidden lg:block border border-ink-black/15 p-[var(--spacing-30)]">
              <OrderSummary
                lines={lines}
                subtotal={subtotal}
                shippingCost={shippingCost}
                codFee={codFee}
                discount={discount}
                discountApplied={discountApplied}
                discountInput={discountInput}
                setDiscountInput={setDiscountInput}
                applyDiscount={applyDiscount}
                total={total}
              />
            </div>
            <div className="lg:hidden">
              <Accordion title="Order Summary">
                <OrderSummary
                  lines={lines}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  codFee={codFee}
                  discount={discount}
                  discountApplied={discountApplied}
                  discountInput={discountInput}
                  setDiscountInput={setDiscountInput}
                  applyDiscount={applyDiscount}
                  total={total}
                />
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderSummary({
  lines,
  subtotal,
  shippingCost,
  codFee,
  discount,
  discountApplied,
  discountInput,
  setDiscountInput,
  applyDiscount,
  total,
}: {
  lines: ReturnType<typeof useCart>["lines"];
  subtotal: number;
  shippingCost: number;
  codFee: number;
  discount: number;
  discountApplied: { code: string; amount: number; label: string } | null;
  discountInput: string;
  setDiscountInput: (v: string) => void;
  applyDiscount: () => void;
  total: number;
}) {
  const [showDiscount, setShowDiscount] = useState(false);

  return (
    <div className="space-y-[var(--spacing-15)]">
      <p className="caption uppercase font-bold">Order Summary</p>
      <div className="space-y-[var(--spacing-15)] max-h-[300px] overflow-y-auto">
        {lines.map((line) => (
          <div
            key={`${line.slug}-${line.size}-${line.colour}`}
            className="flex gap-[var(--spacing-10)]"
          >
            <div className="relative w-14 h-16 shrink-0 bg-ivory-mist">
              <Image
                src={line.image}
                alt={line.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="caption font-bold truncate">{line.name}</p>
              <p className="caption opacity-60">
                {line.colour} · {line.size} · Qty {line.qty}
              </p>
            </div>
            <p className="caption font-bold shrink-0">
              {formatPrice(line.price * line.qty)}
            </p>
          </div>
        ))}
      </div>
      <div className="stitch-line my-[var(--spacing-10)]" />

      {/* Discount code */}
      {discountApplied ? (
        <div className="flex justify-between caption">
          <span>Discount ({discountApplied.code})</span>
          <span className="text-brand-red">–{formatPrice(discount)}</span>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowDiscount((v) => !v)}
            className="caption uppercase link-underline"
          >
            {showDiscount ? "Hide" : "Have a discount code?"}
          </button>
          {showDiscount && (
            <div className="flex gap-[var(--spacing-10)]">
              <input
                type="text"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Enter code"
                className="caption bg-transparent border-b border-ink-black/30 py-[8px] flex-1 outline-none focus:border-[var(--color-brand-red)]"
              />
              <button
                onClick={applyDiscount}
                className="caption uppercase font-bold py-[8px]"
              >
                Apply
              </button>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between caption">
        <span>Subtotal</span>
        <span className="font-bold">{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between caption">
          <span>Discount</span>
          <span className="text-brand-red">–{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between caption">
        <span>Shipping</span>
        <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
      </div>
      {codFee > 0 && (
        <div className="flex justify-between caption">
          <span>COD Fee</span>
          <span>{formatPrice(codFee)}</span>
        </div>
      )}
      <div className="stitch-line my-[var(--spacing-10)]" />
      <div className="flex justify-between caption font-bold text-base">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
