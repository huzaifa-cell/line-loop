"use client";

import { useState } from "react";
import { createDiscount } from "./actions";
import { useRouter } from "next/navigation";

export function CreateDiscountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createDiscount(formData);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to create discount");
      }
    } catch (err: any) {
      alert(err.message || "Error creating discount");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-ink-black text-ivory-mist px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors"
      >
        Add Discount Code
      </button>
    );
  }

  return (
    <div className="border border-ink-black bg-ivory-mist p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest">New Discount Code</h3>
        <button onClick={() => setIsOpen(false)} className="text-xs text-ink-black/60 hover:text-ink-black">✕ Cancel</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Code *</label>
            <input name="code" required placeholder="SUMMER20" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none uppercase" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Type *</label>
            <select name="type" required className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Value *</label>
            <input name="value" type="number" step="0.01" required placeholder="10" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Min Order (Rs)</label>
            <input name="minOrderValue" type="number" step="0.01" placeholder="0" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Usage Limit</label>
            <input name="usageLimit" type="number" placeholder="Unlimited" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Starts At</label>
            <input name="startsAt" type="datetime-local" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">Expires At</label>
            <input name="expiresAt" type="datetime-local" className="w-full bg-transparent border border-ink-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-ink-black text-ivory-mist px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Discount'}
          </button>
        </div>
      </form>
    </div>
  );
}
