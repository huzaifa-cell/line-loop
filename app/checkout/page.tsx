"use client";

import { useCart } from "@/lib/CartContext";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { createStorefrontOrder } from "./actions";

export default function CheckoutPage() {
  const { items, subtotal, shipping, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | "card">("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = shippingMethod === "express" ? 500 : shipping;
  const grandTotal = subtotal + shippingCost;

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

  if (items.length === 0) {
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
                className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm"
              />
              <input
                type="tel"
                placeholder="PHONE NUMBER (E.G. +92 300 1234567)"
                className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm"
              />
            </div>
          </section>

          {/* Shipping Address */}
          <section>
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-4 md:mb-6">Shipping Address</h2>
            <div className="space-y-4">
              <input placeholder="FULL NAME" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
              <input placeholder="ADDRESS LINE 1" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
              <input placeholder="APARTMENT, SUITE, ETC. (OPTIONAL)" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso/60 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm appearance-none">
                  <option value="">City</option>
                  <option value="karachi">Karachi</option>
                  <option value="lahore">Lahore</option>
                  <option value="islamabad">Islamabad</option>
                  <option value="rawalpindi">Rawalpindi</option>
                  <option value="faisalabad">Faisalabad</option>
                  <option value="peshawar">Peshawar</option>
                  <option value="quetta">Quetta</option>
                  <option value="multan">Multan</option>
                </select>
                <input placeholder="PROVINCE" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="POSTAL CODE" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
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
              <div>
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-4 p-4 md:p-5 border border-b-0 rounded-t-sm cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-brand-red bg-brand-red/5" : "border-espresso/10 hover:border-espresso/30"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-brand-red" : "border-espresso/40"}`}>
                    {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                  </div>
                  <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">Credit / Debit Card</span>
                </label>
                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border border-brand-red rounded-b-sm"
                  >
                    <div className="p-4 md:p-5 space-y-4 bg-brand-red/5">
                      <input placeholder="CARD NUMBER" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="EXPIRY (MM/YY)" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
                        <input placeholder="CVV" className="w-full bg-transparent border border-espresso/10 px-4 md:px-5 py-3 font-label-caps text-[12px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* Place Order Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                // In a real app we'd validate the form inputs here
                await createStorefrontOrder({
                  items,
                  shippingMethod,
                  paymentMethod,
                  discountCode,
                  subtotal,
                  shippingCost,
                  grandTotal,
                  shippingAddress: {
                    fullName: "Guest Customer",
                    email: "guest@example.com",
                    city: "Karachi",
                    country: "Pakistan"
                  }
                });
                clearCart();
                setOrderPlaced(true);
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
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                  <div className="relative w-16 h-20 shrink-0 overflow-hidden rounded-sm bg-beige/30">
                    <Image src={item.product.image} alt={item.product.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label-caps text-[11px] text-espresso uppercase tracking-wider truncate">{item.product.name}</h4>
                    <p className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider mt-0.5">
                      Size: {item.selectedSize} / {item.selectedColor}
                    </p>
                    <p className="font-label-caps text-[12px] text-espresso font-medium mt-1">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="border-t border-espresso/10 pt-4 md:pt-6 mb-4 md:mb-6">
              <div className="flex gap-3">
                <input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="DISCOUNT CODE"
                  className="flex-1 bg-transparent border border-espresso/10 px-4 py-3 font-label-caps text-[11px] text-espresso placeholder:text-espresso/40 uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm"
                />
                <button className="px-4 md:px-6 py-3 font-label-caps text-[11px] text-brand-red border border-brand-red/30 rounded-sm uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all cursor-pointer">
                  Apply
                </button>
              </div>
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
