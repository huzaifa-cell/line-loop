"use client";

import { useCart } from "@/lib/cart";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { createStorefrontOrder } from "./actions";
import { validateDiscount } from "./discount-actions";
import type { DiscountResult } from "@/lib/discount";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, shipping, clear } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const shippingCost = shippingMethod === "express" ? 500 : shipping;
  const discountAmount = discountResult?.valid ? discountResult.discount : 0;
  const grandTotal = subtotal + shippingCost - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    try {
      const result = await validateDiscount(discountCode, subtotal);
      setDiscountResult(result);
    } catch {
      setDiscountResult({ valid: false, discount: 0, error: "Failed to validate code" });
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-margin-mobile md:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-8"
        >
          <span className="material-symbols-outlined text-[80px] text-green-500">
            check_circle
          </span>
        </motion.div>
        <AnimatedWrapper delay={0.2}>
          <h1 className="font-headline-md text-headline-md text-espresso uppercase tracking-[0.15em] mb-4">
            Order Confirmed
          </h1>
          <p className="font-body-md text-espresso/70 max-w-md mb-8">
            Thank you for choosing LINE&LOOP. Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-brand-red text-white px-8 md:px-10 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500"
          >
            Continue Shopping
          </Link>
        </AnimatedWrapper>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-margin-mobile md:px-8">
        <span className="material-symbols-outlined text-[64px] text-espresso/30 mb-6">shopping_bag</span>
        <h1 className="font-headline-md text-headline-md text-espresso uppercase tracking-[0.15em] mb-4">
          Your bag is empty
        </h1>
        <p className="font-body-md text-espresso/70 mb-8">Add some items before checking out.</p>
        <Link
          href="/shop"
          className="inline-block bg-brand-red text-white px-8 md:px-10 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500"
        >
          Shop the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-espresso/10 py-4 md:py-6 px-margin-mobile md:px-margin-desktop flex justify-between items-center">
        <Link href="/shop" className="flex items-center gap-2 text-espresso/70 hover:text-brand-red transition-colors font-label-caps text-label-caps uppercase tracking-widest">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Your Bag</span>
        </Link>
        <Link href="/" className="font-headline-md text-headline-md text-espresso uppercase tracking-tighter">
          LINE&LOOP
        </Link>
        <div className="w-[60px] sm:w-[100px]" />
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-10 gap-0 lg:gap-16 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-7xl mx-auto">
        {/* Left Column - Form (60%) */}
        <AnimatedWrapper delay={0.1} className="lg:col-span-6 space-y-8 md:space-y-12">
          {/* Contact */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 md:mb-6">
              <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em]">Contact</h2>
              <span className="font-label-caps text-[11px] text-espresso/70 uppercase tracking-widest">
                Already have an account? <button className="text-espresso underline underline-offset-4 cursor-pointer">Log in</button>
              </span>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.email ? 'border-brand-red' : 'border-espresso/10'}`}
              />
              <input
                type="tel"
                placeholder="PHONE NUMBER (E.G. +92 300 1234567)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.phone ? 'border-brand-red' : 'border-espresso/10'}`}
              />
            </div>
          </section>

          {/* Shipping Address */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-4 md:mb-6">Shipping Address</h2>
            <div className="space-y-4">
              <input placeholder="FULL NAME" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.fullName ? 'border-brand-red' : 'border-espresso/10'}`} />
              <input placeholder="ADDRESS LINE 1" value={formData.address1} onChange={(e) => setFormData({...formData, address1: e.target.value})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.address1 ? 'border-brand-red' : 'border-espresso/10'}`} />
              <input placeholder="APARTMENT, SUITE, ETC. (OPTIONAL)" value={formData.address2} onChange={(e) => setFormData({...formData, address2: e.target.value})} className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm appearance-none ${formData.city ? 'text-espresso' : 'text-espresso/60'} ${formErrors.city ? 'border-brand-red' : 'border-espresso/10'}`}>
                  <option value="" disabled>City</option>
                  <option value="karachi">Karachi</option>
                  <option value="lahore">Lahore</option>
                  <option value="islamabad">Islamabad</option>
                  <option value="rawalpindi">Rawalpindi</option>
                  <option value="faisalabad">Faisalabad</option>
                  <option value="peshawar">Peshawar</option>
                  <option value="quetta">Quetta</option>
                  <option value="multan">Multan</option>
                </select>
                <input placeholder="PROVINCE" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.province ? 'border-brand-red' : 'border-espresso/10'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="POSTAL CODE" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm ${formErrors.postalCode ? 'border-brand-red' : 'border-espresso/10'}`} />
                <input value="PAKISTAN" disabled className="w-full bg-espresso/5 border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso/70 uppercase tracking-widest rounded-sm" />
              </div>
            </div>
          </section>

          {/* Shipping Method */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-4 md:mb-6">Shipping Method</h2>
            <div className="space-y-3">
              <label
                onClick={() => setShippingMethod("standard")}
                className={`flex items-center justify-between p-4 md:p-5 border rounded-sm cursor-pointer transition-all ${
                  shippingMethod === "standard" ? "border-brand-red bg-brand-red/5" : "border-espresso/10 hover:border-espresso/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "standard" ? "border-brand-red" : "border-espresso/40"}`}>
                    {shippingMethod === "standard" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                  </div>
                  <div>
                    <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest block">Standard Delivery</span>
                    <span className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider">3-5 Business Days</span>
                  </div>
                </div>
                <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">Free</span>
              </label>
              <label
                onClick={() => setShippingMethod("express")}
                className={`flex items-center justify-between p-4 md:p-5 border rounded-sm cursor-pointer transition-all ${
                  shippingMethod === "express" ? "border-brand-red bg-brand-red/5" : "border-espresso/10 hover:border-espresso/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === "express" ? "border-brand-red" : "border-espresso/40"}`}>
                    {shippingMethod === "express" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                  </div>
                  <div>
                    <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest block">Express Delivery</span>
                    <span className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider">1-2 Business Days</span>
                  </div>
                </div>
                <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">Rs. 500</span>
              </label>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-4 md:mb-6">Payment</h2>
            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-4 p-4 md:p-5 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "cod" ? "border-brand-red bg-brand-red/5" : "border-espresso/10 hover:border-espresso/30"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-brand-red" : "border-espresso/40"}`}>
                  {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                </div>
                <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">Cash on Delivery (COD)</span>
              </label>
              <label
                onClick={() => setPaymentMethod("bank")}
                className={`flex items-center gap-4 p-4 md:p-5 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "bank" ? "border-brand-red bg-brand-red/5" : "border-espresso/10 hover:border-espresso/30"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bank" ? "border-brand-red" : "border-espresso/40"}`}>
                  {paymentMethod === "bank" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                </div>
                <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">Bank Transfer</span>
              </label>
              {paymentMethod === "bank" && (
                <div className="p-4 bg-espresso/5 border border-espresso/10 rounded-sm">
                  <p className="font-body-md text-[12px] text-espresso leading-relaxed">
                    Please transfer the total amount to the following bank account. You will need to upload a screenshot of your payment on the next step.
                    <br /><br />
                    <strong>Bank Name:</strong> Meezan Bank<br />
                    <strong>Account Title:</strong> LINE AND LOOP<br />
                    <strong>Account Number:</strong> 01234567890123
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Place Order Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              setFormErrors({});
              
              const errors: Record<string, string> = {};
              if (!formData.email) errors.email = "Required";
              if (!formData.phone) errors.phone = "Required";
              if (!formData.fullName) errors.fullName = "Required";
              if (!formData.address1) errors.address1 = "Required";
              if (!formData.city) errors.city = "Required";
              if (!formData.province) errors.province = "Required";
              if (!formData.postalCode) errors.postalCode = "Required";

              if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                setIsSubmitting(false);
                return;
              }

              try {
                const result = await createStorefrontOrder({
                  items: lines.map(line => ({
                    product: { id: line.id, name: line.name, price: line.price, image: line.image, slug: "", description: "", originalPrice: 0, category: "", status: "active", createdAt: "" },
                    quantity: line.qty,
                    selectedSize: line.size,
                    selectedColor: line.colour
                  })),
                  shippingMethod,
                  paymentMethod,
                  discountCode: discountResult?.valid ? discountCode : "",
                  discountAmount,
                  discountId: discountResult?.discountId || null,
                  subtotal,
                  shippingCost,
                  grandTotal,
                  shippingAddress: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    addressLine1: formData.address1,
                    addressLine2: formData.address2,
                    city: formData.city,
                    province: formData.province,
                    postalCode: formData.postalCode,
                    country: "Pakistan"
                  }
                });
                
                clear();
                
                if (paymentMethod === "bank" && result.success && result.orderNumber) {
                  router.push(`/checkout/upload-proof?order=${result.orderNumber}`);
                } else {
                  setOrderPlaced(true);
                }
              } catch (err) {
                console.error(err);
                alert("Failed to place order.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="w-full bg-brand-red text-white py-4 md:py-5 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500 shadow-lg shadow-brand-red/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </motion.button>
        </AnimatedWrapper>

        {/* Right Column - Order Summary (40%) */}
        <AnimatedWrapper delay={0.3} className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-8 border border-espresso/10 rounded-md p-6 md:p-8 bg-espresso/5">
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-6 md:mb-8">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {lines.map((line) => (
                <div key={`${line.id}-${line.size}-${line.colour}`} className="flex gap-4">
                  <div className="relative w-16 h-20 shrink-0 overflow-hidden rounded-sm bg-beige/30">
                    <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label-caps text-[11px] text-espresso uppercase tracking-wider truncate">{line.name}</h4>
                    <p className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider mt-0.5">
                      Size: {line.size} / {line.colour}
                    </p>
                    <p className="font-label-caps text-[12px] text-espresso font-medium mt-1">Rs. {(line.price * line.qty).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="border-t border-espresso/10 pt-4 md:pt-6 mb-4 md:mb-6">
              <div className="flex gap-3">
                <input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    if (discountResult) setDiscountResult(null);
                  }}
                  placeholder="DISCOUNT CODE"
                  className="flex-1 bg-transparent border border-espresso/10 px-4 py-3 font-label-caps text-[11px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount || !discountCode.trim()}
                  className="px-4 md:px-6 py-3 font-label-caps text-[11px] text-brand-red border border-brand-red/30 rounded-sm uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isApplyingDiscount ? "..." : "Apply"}
                </button>
              </div>
              {discountResult && (
                <p className={`mt-2 font-label-caps text-[11px] tracking-widest ${
                  discountResult.valid ? "text-green-600" : "text-brand-red"
                }`}>
                  {discountResult.valid
                    ? `✓ ${discountResult.label} applied (–Rs ${discountResult.discount.toLocaleString()})`
                    : discountResult.error}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-espresso/10 pt-4 md:pt-6">
              <div className="flex justify-between font-label-caps text-[11px] uppercase tracking-widest">
                <span className="text-espresso/70">Subtotal</span>
                <span className="text-espresso font-medium">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-label-caps text-[11px] uppercase tracking-widest">
                <span className="text-espresso/70">Shipping</span>
                <span className={shippingCost === 0 ? "text-brand-red font-medium" : "text-espresso font-medium"}>
                  {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost.toLocaleString()}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between font-label-caps text-[11px] uppercase tracking-widest">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600 font-medium">–Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="border-t border-espresso/10 pt-4 md:pt-6 mt-4 md:mt-6">
              <div className="flex justify-between items-baseline">
                <span className="font-label-caps text-label-caps text-espresso/70 uppercase tracking-widest">Total</span>
                <span className="font-headline-md text-headline-md text-espresso">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mt-8 md:mt-10 pt-6 md:pt-8 border-t border-espresso/10">
              <div className="text-center">
                <span className="material-symbols-outlined text-[24px] md:text-[28px] text-espresso/40 block mb-2">lock</span>
                <span className="font-label-caps text-[9px] text-espresso/60 uppercase tracking-widest">Secure Payment</span>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-[24px] md:text-[28px] text-espresso/40 block mb-2">replay</span>
                <span className="font-label-caps text-[9px] text-espresso/60 uppercase tracking-widest">Free Returns</span>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-[24px] md:text-[28px] text-espresso/40 block mb-2">favorite</span>
                <span className="font-label-caps text-[9px] text-espresso/60 uppercase tracking-widest">Handmade Quality</span>
              </div>
            </div>
          </div>
        </AnimatedWrapper>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-espresso/10 py-4 md:py-6 px-margin-mobile md:px-margin-desktop flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-headline-sm text-headline-sm text-espresso uppercase tracking-tighter">LINE&LOOP</span>
        <div className="flex gap-4 md:gap-6 font-label-caps text-[10px] text-espresso/70 uppercase tracking-widest">
          <a href="#" className="hover:text-brand-red transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-red transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-red transition-colors">Shipping & Returns</a>
        </div>
        <span className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-widest">© 2024 LINE&LOOP. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
