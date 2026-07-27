"use client";

import { useState, use, Suspense } from "react";
import { uploadPaymentProof } from "./actions";
import Link from "next/link";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";

function UploadProofContent({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderNumber } = use(searchParams);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!orderNumber) {
    return (
      <div className="text-center py-20">
        <h1 className="font-headline-sm text-2xl mb-4 text-espresso">Invalid Order</h1>
        <p className="font-body-md text-espresso/70 mb-8">No order number provided.</p>
        <Link href="/" className="px-6 py-3 bg-espresso text-white font-label-caps text-xs tracking-widest uppercase rounded-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError("");
    
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!selected.type.startsWith("image/") && selected.type !== "application/pdf") {
      setError("Please upload an image or PDF file.");
      setFile(null);
      setPreview(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selected);
    
    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview(null); // No preview for PDF
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadPaymentProof(orderNumber, formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to upload proof.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <AnimatedWrapper className="text-center py-10 md:py-20 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-green-600 text-3xl">check</span>
        </div>
        <h1 className="font-headline-sm text-2xl md:text-3xl mb-4 text-espresso">Payment Proof Received</h1>
        <p className="font-body-md text-espresso/70 leading-relaxed mb-8">
          Thank you for uploading your payment screenshot for order <strong className="text-espresso">#{orderNumber}</strong>.<br/><br/>
          Our team will review it shortly. Once verified, your order status will be updated to Confirmed.
        </p>
        <Link href="/account" className="px-8 py-4 bg-brand-red text-white font-label-caps text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-espresso transition-colors">
          View My Orders
        </Link>
      </AnimatedWrapper>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatedWrapper className="bg-white p-6 md:p-10 border border-espresso/10 rounded-sm">
        <h1 className="font-headline-sm text-2xl mb-2 text-espresso text-center uppercase tracking-wider">
          Upload Payment Proof
        </h1>
        <p className="font-body-md text-espresso/70 text-center mb-8">
          Order Number: <strong className="text-espresso">#{orderNumber}</strong>
        </p>

        <div className="bg-espresso/5 border border-espresso/10 p-6 rounded-sm mb-8">
          <h2 className="font-label-caps text-xs uppercase tracking-widest text-espresso mb-4 font-bold">
            Bank Details
          </h2>
          <div className="space-y-2 font-body-md text-sm text-espresso/80">
            <p><strong>Bank Name:</strong> Meezan Bank</p>
            <p><strong>Account Title:</strong> LINE AND LOOP</p>
            <p><strong>Account Number:</strong> 01234567890123</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-label-caps text-xs uppercase tracking-widest text-espresso/70 mb-2">
              Payment Screenshot (Image or PDF)
            </label>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-sm font-body-md text-espresso file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-label-caps file:uppercase file:tracking-widest file:bg-espresso/5 file:text-espresso hover:file:bg-espresso/10 cursor-pointer"
            />
          </div>

          {preview && (
            <div className="mt-4 border border-espresso/10 rounded-sm p-2 bg-espresso/5">
              <img src={preview} alt="Receipt preview" className="max-h-64 mx-auto object-contain" />
            </div>
          )}

          {error && (
            <p className="text-brand-red text-sm font-body-md">{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full mt-4 bg-brand-red text-white py-4 font-label-caps text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-espresso transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Submit Payment Proof"}
          </button>
        </div>
      </AnimatedWrapper>
    </div>
  );
}

export default function UploadProofPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  return (
    <section className="bg-warm-parchment min-h-[80vh] py-12 md:py-24 px-margin-mobile md:px-margin-desktop flex items-center justify-center">
      <Suspense fallback={<div className="text-center font-body-md text-espresso/60">Loading...</div>}>
        <UploadProofContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
