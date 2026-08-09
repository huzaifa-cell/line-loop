"use client";

import { useCart } from "@/lib/cart";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { createStorefrontOrder } from "./actions";
import { uploadPaymentProof } from "./upload-proof/actions";
import { validateDiscount } from "./discount-actions";
import type { DiscountResult } from "@/lib/discount";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const isVideo = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
};

const pakistanProvinces: Record<string, string[]> = {
  "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha"],
  "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad", "Swat"],
  "Balochistan": ["Quetta", "Gwadar", "Khuzdar", "Chaman", "Turbat"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza"],
  "Azad Kashmir": ["Muzaffarabad", "Mirpur", "Rawalakot"]
};

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { lines, subtotal, shipping, clear } = useCart();
  const shippingMethod = "standard";
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<DiscountResult | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [paymentProofError, setPaymentProofError] = useState("");
  
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

  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.primaryEmailAddress?.emailAddress || "",
        fullName: prev.fullName || user.fullName || "",
      }));
    }
  }, [isLoaded, isSignedIn, user]);

  const shippingCost = shipping;
  const discountAmount = discountResult?.valid ? discountResult.discount : 0;
  const grandTotal = subtotal + shippingCost - discountAmount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setPaymentProofError("");
    
    if (!selected) {
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }

    if (!selected.type.startsWith("image/") && selected.type !== "application/pdf") {
      setPaymentProofError("Please upload an image or PDF file.");
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setPaymentProofError("File is too large. Maximum size is 5MB.");
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }

    setPaymentProofFile(selected);
    
    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPaymentProofPreview(url);
    } else {
      setPaymentProofPreview(null);
    }
  };

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
      <main className="flex flex-col gap-8 md:gap-12 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-3xl mx-auto">
        {/* Form Sections */}
        <AnimatedWrapper delay={0.1} className="space-y-8 md:space-y-12">
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
                <select value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value, city: ""})} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm appearance-none ${formData.province ? 'text-espresso' : 'text-espresso/60'} ${formErrors.province ? 'border-brand-red' : 'border-espresso/10'}`}>
                  <option value="" disabled>PROVINCE</option>
                  {Object.keys(pakistanProvinces).map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} disabled={!formData.province} className={`w-full bg-transparent border px-4 md:px-5 py-3 md:py-4 font-label-caps text-[12px] uppercase tracking-widest focus:border-brand-red focus:ring-0 transition-colors rounded-sm appearance-none ${formData.city ? 'text-espresso' : 'text-espresso/60'} ${formErrors.city ? 'border-brand-red' : 'border-espresso/10'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="" disabled>CITY</option>
                  {formData.province && pakistanProvinces[formData.province]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
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
                className="flex items-center justify-between p-4 md:p-5 border border-brand-red bg-brand-red/5 rounded-sm cursor-default transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full border-2 border-brand-red flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-red" />
                  </div>
                  <div>
                    <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest block">Standard Delivery</span>
                    <span className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider">3-5 Business Days</span>
                  </div>
                </div>
                <span className="font-label-caps text-[12px] text-espresso uppercase tracking-widest">
                  Rs. 500
                </span>
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
                <div className="p-4 bg-espresso/5 border border-espresso/10 rounded-sm space-y-4">
                  <p className="font-body-md text-[12px] text-espresso leading-relaxed">
                    Please transfer the total amount to the following bank account and upload a screenshot of your payment below.
                    <br /><br />
                    <strong>Bank Name:</strong> Meezan Bank<br />
                    <strong>Account Title:</strong> LINE AND LOOP<br />
                    <strong>Account Number:</strong> 01234567890123
                  </p>
                  <div>
                    <label className="block font-label-caps text-xs uppercase tracking-widest text-espresso/70 mb-2">
                      Payment Screenshot (Required)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="w-full text-sm font-body-md text-espresso file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-label-caps file:uppercase file:tracking-widest file:bg-espresso/5 file:text-espresso hover:file:bg-espresso/10 cursor-pointer"
                    />
                    {paymentProofPreview && (
                      <div className="mt-4 border border-espresso/10 rounded-sm p-2 bg-espresso/5">
                        <img src={paymentProofPreview} alt="Receipt preview" className="max-h-40 mx-auto object-contain" />
                      </div>
                    )}
                    {paymentProofError && (
                      <p className="text-brand-red text-sm font-body-md mt-2">{paymentProofError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

        </AnimatedWrapper>

        {/* Order Summary */}
        <AnimatedWrapper delay={0.2}>
          <div className="border border-espresso/10 rounded-md p-6 md:p-8 bg-espresso/5">
            <h2 className="font-headline-sm text-headline-sm text-espresso uppercase tracking-[0.1em] mb-6 md:mb-8">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              {lines.map((line) => (
                <div key={`${line.id}-${line.size}-${line.colour}`} className="flex gap-4">
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-sm bg-beige/30">
                    {isVideo(line.image) ? (
                      <video src={line.image} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                    ) : (
                      <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
                    )}
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

        {/* Place Order Button */}
        <AnimatedWrapper delay={0.3}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              setFormErrors({});
              
              const errors: Record<string, string> = {};
              
              // Email validation
              if (!formData.email) {
                errors.email = "Email is required";
              } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = "Please enter a valid email address";
              }
              
              // Phone validation — Pakistani format
              const cleanPhone = formData.phone.replace(/[\s\-()]/g, "");
              if (!cleanPhone) {
                errors.phone = "Phone number is required";
              } else if (!/^(\+92|0)?3\d{9}$/.test(cleanPhone)) {
                errors.phone = "Enter a valid Pakistani number (e.g. 03001234567)";
              }
              
              if (!formData.fullName || formData.fullName.length < 2) errors.fullName = "Full name is required";
              if (!formData.address1 || formData.address1.length < 3) errors.address1 = "Address is required";
              if (!formData.city) errors.city = "City is required";
              if (!formData.province) errors.province = "Province is required";
              if (!formData.postalCode || formData.postalCode.length < 4) errors.postalCode = "Valid postal code is required";

              if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                toast("Please fix the highlighted fields before continuing.", "error");
                setIsSubmitting(false);
                return;
              }

              if (paymentMethod === "bank" && !paymentProofFile) {
                setPaymentProofError("Please upload a payment screenshot to proceed.");
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
                
                if (paymentMethod === "bank" && paymentProofFile) {
                  const proofFormData = new FormData();
                  proofFormData.append("file", paymentProofFile);
                  const uploadRes = await uploadPaymentProof(result.orderNumber, proofFormData);
                  if (!uploadRes.success) {
                    console.error("Proof upload failed:", uploadRes.error);
                    toast("Order created, but payment proof upload failed. Please contact support.", "error");
                  }
                }
                
                clear();
                setOrderPlaced(true);
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to place order. Please try again.";
                toast(message, "error");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="w-full bg-brand-red text-white py-4 md:py-5 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500 shadow-lg shadow-brand-red/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </motion.button>
        </AnimatedWrapper>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-espresso/10 py-4 md:py-6 px-margin-mobile md:px-margin-desktop flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-headline-sm text-headline-sm text-espresso uppercase tracking-tighter">LINE&LOOP</span>
        <div className="flex gap-4 md:gap-6 font-label-caps text-[10px] text-espresso/70 uppercase tracking-widest">
          <Link href="/privacy" className="hover:text-brand-red transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-red transition-colors">Terms of Service</Link>
          <Link href="/shipping-returns" className="hover:text-brand-red transition-colors">Shipping & Returns</Link>
        </div>
        <span className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-widest">© 2026 LINE&LOOP. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
